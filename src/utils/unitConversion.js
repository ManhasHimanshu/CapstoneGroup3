// src/utils/unitConversion.js

// Convert speed from mph to km/h
export const convertSpeed = (speedInMph, system) => {
  if (system === 'metric') {
    return speedInMph * 1.60934; // mph to km/h
  }
  return speedInMph; // return as mph
};

// Convert distance from feet to meters
export const convertDistance = (distanceInFeet, system) => {
  if (system === 'metric') {
    return distanceInFeet * 0.3048; // feet to meters
  }
  return distanceInFeet; // return as feet
};

// Get speed unit label
export const getSpeedUnit = (system) => {
  return system === 'metric' ? 'km/h' : 'mph';
};

// Get distance unit label
export const getDistanceUnit = (system) => {
  return system === 'metric' ? 'm' : 'ft';
};

// Format speed with appropriate unit
export const formatSpeed = (speedInMph, system) => {
  if (speedInMph == null) return '—';
  const speed = convertSpeed(speedInMph, system);
  const unit = getSpeedUnit(system);
  return `${speed.toFixed(1)} ${unit}`;
};

// Format distance with appropriate unit
export const formatDistance = (distanceInFeet, system) => {
  if (distanceInFeet == null) return '—';
  const distance = convertDistance(distanceInFeet, system);
  const unit = getDistanceUnit(system);
  return `${distance.toFixed(1)} ${unit}`;
};