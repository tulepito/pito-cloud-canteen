import { types as sdkTypes } from './sdkLoader';

const { LatLng, LatLngBounds } = sdkTypes;

// An array of locations to show in the LocationAutocompleteInput when
// the input is in focus but the user hasn't typed in any search yet.
//
// Each item in the array should be an object with a unique `id` (String) and a
// `predictionPlace` (util.types.place) properties.
const defaultLocationSearches = [
  {
    id: 'default-new-york',
    predictionPlace: {
      address: 'New York City, New York, USA',
      bounds: new LatLngBounds(
        new LatLng(40.917576401307, -73.7008392055224),
        new LatLng(40.477399, -74.2590879797556),
      ),
    },
  },
];

export default defaultLocationSearches;
