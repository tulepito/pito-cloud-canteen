/* eslint-disable class-methods-use-this */
import {
  getPlaceDetails,
  getPlacePredictions,
  locationBounds,
} from '@utils/googleMaps';
import { userLocation } from '@utils/maps';
import classNames from 'classnames';
import React from 'react';

import config from '../../configs';
import css from './LocationAutocompleteInput.module.scss';

export const CURRENT_LOCATION_ID = 'current-location';

// When displaying data from the Google Maps Places API, and
// attribution is required next to the results.
// See: https://developers.google.com/places/web-service/policies#powered
type TGeocoderAttribution = {
  rootClassName?: string;
  className?: string;
};
export const GeocoderAttribution = (props: TGeocoderAttribution) => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.poweredByGoogle, className);
  return <div className={classes} />;
};

/**
 * A forward geocoding (place name -> coordinates) implementation
 * using the Google Maps Places API.
 */
class GeocoderGoogleMaps {
  sessionToken: null;

  constructor() {
    this.sessionToken = null;
  }

  getSessionToken() {
    const { maps } = (window as any).google;

    this.sessionToken =
      this.sessionToken || new maps.places.AutocompleteSessionToken();
    return this.sessionToken;
  }

  // Public API
  //

  /**
   * Search places with the given name.
   *
   * @param {String} search query for place names
   *
   * @return {Promise<{ search: String, predictions: Array<Object>}>}
   * results of the geocoding, should have the original search query
   * and an array of predictions. The format of the predictions is
   * only relevant for the `getPlaceDetails` function below.
   */
  getPlacePredictions(search: string) {
    const limitCountriesMaybe = config.maps.search.countryLimit
      ? {
          componentRestrictions: {
            country: config.maps.search.countryLimit,
          },
        }
      : {};

    return getPlacePredictions(
      search,
      this.getSessionToken(),
      limitCountriesMaybe,
    ).then((results: any) => {
      return {
        search,
        predictions: results.predictions,
      };
    });
  }

  /**
   * Get the ID of the given prediction.
   */
  getPredictionId(prediction: any) {
    if (prediction.predictionPlace) {
      // default prediction defined above
      return prediction.id;
    }
    // prediction from Google Maps Places API
    return prediction.place_id;
  }

  /**
   * Get the address text of the given prediction.
   */
  getPredictionAddress(prediction: any) {
    if (prediction.predictionPlace) {
      // default prediction defined above
      return prediction.predictionPlace.address;
    }
    // prediction from Google Maps Places API
    return prediction.description;
  }

  /**
   * Fetch or read place details from the selected prediction.
   *
   * @param {Object} prediction selected prediction object
   *
   * @return {Promise<util.propTypes.place>} a place object
   */
  getPlaceDetails(prediction: any) {
    if (this.getPredictionId(prediction) === CURRENT_LOCATION_ID) {
      return userLocation().then((latlng) => {
        return {
          address: '',
          origin: latlng,
          bounds: locationBounds(
            latlng,
            config.maps.search.currentLocationBoundsDistance,
          ),
        };
      });
    }

    if (prediction.predictionPlace) {
      return Promise.resolve(prediction.predictionPlace);
    }

    return getPlaceDetails(prediction.place_id, this.getSessionToken()).then(
      (place) => {
        this.sessionToken = null;
        return place;
      },
    );
  }
}

export default GeocoderGoogleMaps;
