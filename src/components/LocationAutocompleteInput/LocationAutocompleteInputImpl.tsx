/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';

import config from '../../configs';

import GeocoderGoogleMaps, {
  CURRENT_LOCATION_ID,
  GeocoderAttribution,
} from './GeocoderGoogleMaps';
import IconCurrentLocation from './IconCurrentLocation';

import css from './LocationAutocompleteInput.module.scss';

// A list of default predictions that can be shown when the user
// focuses on the autocomplete input without typing a search. This can
// be used to reduce typing and Geocoding API calls for common
// searches.

export const defaultPredictions = (
  config.maps.search.suggestCurrentLocation
    ? [{ id: CURRENT_LOCATION_ID, predictionPlace: {} }]
    : []
).concat(config.maps.search.defaults);

const DEBOUNCE_WAIT_TIME = 400;
const KEY_CODE_ARROW_UP = 38;
const KEY_CODE_ARROW_DOWN = 40;
const KEY_CODE_ENTER = 13;
const KEY_CODE_TAB = 9;
const KEY_CODE_ESC = 27;
const DIRECTION_UP = 'up';
const DIRECTION_DOWN = 'down';
const TOUCH_TAP_RADIUS = 5; // Movement within 5px from touch start is considered a tap

// Touch devices need to be able to distinguish touches for scrolling and touches to tap
const getTouchCoordinates = (nativeEvent: any) => {
  const touch =
    nativeEvent && nativeEvent.changedTouches
      ? nativeEvent.changedTouches[0]
      : null;
  return touch ? { x: touch.screenX, y: touch.screenY } : null;
};

// Renders the autocompletion prediction results in a list
const LocationPredictionsList = (props: any) => {
  const {
    rootClassName,
    className,
    attributionClassName,
    predictions,
    geocoder,
    highlightedIndex,
    onSelectStart,
    onSelectMove,
    onSelectEnd,
  } = props;

  if (predictions.length === 0) {
    return null;
  }

  const item = (prediction: any, index: any) => {
    const isHighlighted = index === highlightedIndex;
    const predictionId = geocoder.getPredictionId(prediction);
    const itemClasses = isHighlighted ? { className: css.highlighted } : {};
    return (
      <li
        {...itemClasses}
        key={predictionId}
        onTouchStart={(e) => {
          e.preventDefault();
          onSelectStart(getTouchCoordinates(e.nativeEvent));
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onSelectStart();
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          onSelectMove(getTouchCoordinates(e.nativeEvent));
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onSelectEnd(prediction);
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          onSelectEnd(prediction);
        }}>
        {predictionId === CURRENT_LOCATION_ID ? (
          <span className={css.currentLocation}>
            <IconCurrentLocation />
            <FormattedMessage id="LocationAutocompleteInput.currentLocation" />
          </span>
        ) : (
          geocoder.getPredictionAddress(prediction)
        )}
      </li>
    );
  };

  const classes = classNames(rootClassName || css.predictionsRoot, className);

  return (
    <div className={classes}>
      <ul className={css.predictions}>{predictions.map(item)}</ul>
      <GeocoderAttribution className={attributionClassName} />
    </div>
  );
};

// Get the current value with defaults from the given
// LocationAutocompleteInput props.
const currentValue = (value: any) => {
  const { search = '', predictions = [], selectedPlace = null } = value || {};
  return { search, predictions, selectedPlace };
};

/*
  Location auto completion input component

  This component can work as the `component` prop to Final Form's
  <Field /> component. It takes a custom input value shape, and
  controls the onChange callback that is called with the input value.

  The component works by listening to the underlying input component
  and calling a Geocoder implementation for predictions. When the
  predictions arrive, those are passed to Final Form in the onChange
  callback.

  See the LocationAutocompleteInput.example.js file for a usage
  example within a form.
*/
const LocationAutocompleteInputImpl = (props: any) => {
  const {
    autoFocus,
    rootClassName,
    className,
    iconClassName,
    inputClassName,
    predictionsClassName,
    predictionsAttributionClassName,
    validClassName,
    placeholder,
    input,
    meta,
    ref,
    disabled = false,
  } = props;
  const {
    onChange: onChangeInput,
    value: valueInput,
    onBlur: onBlurInput,
  } = input;

  const [isMounted, setIsMounted] = useState(false);
  const [inputHasFocus, setInputHasFocus] = useState(false);
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  const [touchStartedFrom, setTouchStartedFrom] = useState<any>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [fetchingPlaceDetails, setFetchingPlaceDetails] = useState(false);
  const [fetchingPredictions, setFetchingPredictions] = useState(false);
  const [isSwipe, setIsSwipe] = useState(false);

  // Ref to the input element.
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shortQueryTimeoutRef = useRef(0);
  const geocoderRef = useRef(null);
  // Debounce the method to avoid calling the API too many times
  // when the user is typing fast.

  useEffect(() => {
    setIsMounted(true);
    return () => {
      window.clearTimeout(shortQueryTimeoutRef.current);
      setIsMounted(false);
    };
  }, []);

  const getGeocoder = () => {
    // Create the Geocoder as late as possible only when it is needed.
    if (!geocoderRef.current) {
      geocoderRef.current = new (GeocoderGoogleMaps as any)();
    }
    return geocoderRef.current as any;
  };

  const currentPredictions = () => {
    const { search, predictions: fetchedPredictions } =
      currentValue(valueInput);
    const { useDefaultPredictions } = props;
    const hasFetchedPredictions =
      fetchedPredictions && fetchedPredictions.length > 0;
    const showDefaultPredictions =
      !search && !hasFetchedPredictions && useDefaultPredictions;

    return showDefaultPredictions ? defaultPredictions : fetchedPredictions;
  };

  // Interpret input key event
  const onKeyDown = (e: any) => {
    if (e.keyCode === KEY_CODE_ARROW_UP) {
      // Prevent changing cursor position in input
      e.preventDefault();
      changeHighlight(DIRECTION_UP);
    } else if (e.keyCode === KEY_CODE_ARROW_DOWN) {
      // Prevent changing cursor position in input
      e.preventDefault();
      changeHighlight(DIRECTION_DOWN);
    } else if (e.keyCode === KEY_CODE_ENTER) {
      const { selectedPlace } = currentValue(valueInput);

      if (!selectedPlace) {
        // Prevent form submit, try to select value instead.
        e.preventDefault();
        e.stopPropagation();
        selectItemIfNoneSelected();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        inputRef.current && inputRef.current.blur();
      }
    } else if (e.keyCode === KEY_CODE_TAB) {
      selectItemIfNoneSelected();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      inputRef.current && inputRef.current.blur();
    } else if (e.keyCode === KEY_CODE_ESC && inputRef.current) {
      inputRef.current.blur();
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const predict = (search: any) => {
    setFetchingPredictions(true);
    return getGeocoder()
      .getPlacePredictions(search)
      .then((results: any) => {
        setFetchingPredictions(false);
        // If the earlier predictions arrive when the user has already
        // changed the search term, ignore and wait until the latest
        // predictions arrive. Without this logic, results for earlier
        // requests would override whatever the user had typed since.
        //
        // This is essentially the same as switchLatest in RxJS or
        // takeLatest in Redux Saga, without canceling the earlier
        // requests.

        onChangeInput({
          search: results.search,
          predictions: results.predictions,
          selectedPlace: null,
        });
      })
      .catch((e: any) => {
        setFetchingPredictions(false);
        console.error(e);
        const value = currentValue(valueInput);
        onChangeInput({
          ...value,
          selectedPlace: null,
        });
      });
  };

  // Handle input text change, fetch predictions if the value isn't empty
  const onChange = (e: any) => {
    const predictions = currentPredictions();
    const newValue = e.target.value;

    // Clear the current values since the input content is changed
    onChangeInput({
      search: newValue,
      predictions: newValue ? predictions : [],
      selectedPlace: null,
    });

    // Clear highlighted prediction since the input value changed and
    // results will change as well
    setHighlightedIndex(-1);

    if (!newValue) {
      // No need to fetch predictions on empty input
      if (shortQueryTimeoutRef.current) {
        window.clearTimeout(shortQueryTimeoutRef.current);
      }
      return;
    }

    if (shortQueryTimeoutRef.current) {
      window.clearTimeout(shortQueryTimeoutRef.current);
    }

    shortQueryTimeoutRef.current = window.setTimeout(() => {
      predict(newValue);
    }, DEBOUNCE_WAIT_TIME);
  };

  // Change the currently highlighted item by calculating the new
  // index from the current state and the given direction number
  // (DIRECTION_UP or DIRECTION_DOWN)
  const changeHighlight = (direction: any) => {
    const predictions = currentPredictions();
    const currentIndex = highlightedIndex;
    let index = currentIndex;

    if (direction === DIRECTION_UP) {
      // Keep the first position if already highlighted
      index = currentIndex === 0 ? 0 : currentIndex - 1;
    } else if (direction === DIRECTION_DOWN) {
      index = currentIndex + 1;
    }

    // Check that the index is within the bounds
    if (index < 0) {
      index = -1;
    } else if (index >= predictions.length) {
      index = predictions.length - 1;
    }

    setHighlightedIndex(index);
  };

  // Select the prediction in the given item. This will fetch/read the
  // place details and set it as the selected place.
  const selectPrediction = (prediction: any) => {
    onChangeInput({
      ...valueInput,
      selectedPlace: null,
    });

    setFetchingPlaceDetails(true);
    return getGeocoder()
      .getPlaceDetails(prediction)
      .then((place: any) => {
        if (!isMounted) {
          // Ignore if component already unmounted
          return;
        }
        setFetchingPlaceDetails(false);
        onChangeInput({
          search: place.address,
          predictions: [],
          selectedPlace: place,
        });
      })
      .catch((e: any) => {
        setFetchingPlaceDetails(false);

        console.error(e);
        onChangeInput({
          ...valueInput,
          selectedPlace: null,
        });
      });
  };

  const selectItemIfNoneSelected = () => {
    if (fetchingPredictions) {
      // No need to select anything since prediction fetch is still going on
      return;
    }

    const { search, selectedPlace } = currentValue(valueInput);
    const predictions = currentPredictions();
    if (!selectedPlace) {
      if (predictions && predictions.length > 0) {
        const index = highlightedIndex !== -1 ? highlightedIndex : 0;
        selectPrediction(predictions[index]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        predict(search);
      }
    }
  };

  const finalizeSelection = () => {
    setInputHasFocus(false);
    setHighlightedIndex(-1);
    onBlurInput(currentValue(valueInput));
  };

  const handleOnBlur = () => {
    if (props.closeOnBlur && !selectionInProgress) {
      finalizeSelection();
    }
  };

  const handlePredictionsSelectStart = (touchCoordinates: any) => {
    setSelectionInProgress(true);
    setTouchStartedFrom(touchCoordinates);
    setIsSwipe(false);
  };

  const handlePredictionsSelectMove = (touchCoordinates: any) => {
    const isTouchAction = !!touchStartedFrom;
    const newIsSwipe = isTouchAction
      ? // eslint-disable-next-line no-unsafe-optional-chaining
        Math.abs(touchStartedFrom?.y - touchCoordinates?.y) > TOUCH_TAP_RADIUS
      : false;
    setSelectionInProgress(false);
    setIsSwipe(newIsSwipe);
  };

  const handlePredictionsSelectEnd = (prediction: any) => {
    let selectAndFinalize = false;
    if (!isSwipe) {
      selectAndFinalize = true;
    }
    setSelectionInProgress(false);
    setTouchStartedFrom(null);
    setIsSwipe(false);

    if (selectAndFinalize) {
      selectPrediction(prediction);
      finalizeSelection();
    }
  };

  const { name, onFocus } = input;
  const { search } = currentValue(valueInput);
  const { touched, valid } = meta || {};
  const isValid = valid && touched;
  const predictions = currentPredictions();

  const handleOnFocus = (e: any) => {
    setInputHasFocus(true);
    onFocus(e);
  };

  const rootClass = classNames(rootClassName || css.root, className);
  const iconClass = classNames(iconClassName || css.icon);
  const inputClass = classNames(inputClassName || css.input, {
    [validClassName]: isValid,
  });
  const predictionsClass = classNames(predictionsClassName);

  // Only render predictions when the input has focus. For
  // development and easier workflow with the browser devtools, you
  // might want to hardcode this to `true`. Otherwise the dropdown
  // list will disappear.
  const renderPredictions = inputHasFocus;

  return (
    <div className={rootClass}>
      <div className={iconClass}>
        {fetchingPlaceDetails && <IconSpinner className={css.iconSpinner} />}
      </div>
      <input
        className={inputClass}
        type="search"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        name={name}
        value={search}
        disabled={fetchingPlaceDetails || disabled}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
        ref={(node) => {
          inputRef.current = node;
          if (ref) {
            ref(node);
          }
        }}
      />
      {renderPredictions ? (
        <LocationPredictionsList
          rootClassName={predictionsClass}
          attributionClassName={predictionsAttributionClassName}
          predictions={predictions}
          geocoder={getGeocoder()}
          highlightedIndex={highlightedIndex}
          onSelectStart={handlePredictionsSelectStart}
          onSelectMove={handlePredictionsSelectMove}
          onSelectEnd={handlePredictionsSelectEnd}
        />
      ) : null}
    </div>
  );
};

export default LocationAutocompleteInputImpl;
