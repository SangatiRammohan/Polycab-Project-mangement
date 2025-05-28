import React, { useState, useEffect } from 'react';
import locationData from './locationData';
import './FilterComponent.css';

const StateFilter = ({ onFilterChange }) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedBusinessArea, setSelectedBusinessArea] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  // Available options based on current selections
  const [availableBusinessAreas, setAvailableBusinessAreas] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);

  // Get states from locationData
  const states = locationData.states || [];

  // Update available business areas when state changes
  useEffect(() => {
    if (selectedState) {
      setAvailableBusinessAreas(locationData[selectedState]?.businessAreas || []);
      setSelectedBusinessArea('');
    } else {
      setAvailableBusinessAreas([]);
      setSelectedBusinessArea('');
    }
    setSelectedDistrict('');
    setSelectedBlock('');
  }, [selectedState]);

  // Update available districts when business area changes
  useEffect(() => {
    if (selectedState && selectedBusinessArea) {
      setAvailableDistricts(locationData[selectedState]?.[selectedBusinessArea]?.districts || []);
      setSelectedDistrict('');
    } else {
      setAvailableDistricts([]);
      setSelectedDistrict('');
    }
    setSelectedBlock('');
  }, [selectedState, selectedBusinessArea]);

  // Update available blocks when district changes
  useEffect(() => {
    if (selectedState && selectedBusinessArea && selectedDistrict) {
      setAvailableBlocks(locationData[selectedState]?.[selectedBusinessArea]?.[selectedDistrict] || []);
      setSelectedBlock('');
    } else {
      setAvailableBlocks([]);
      setSelectedBlock('');
    }
  }, [selectedState, selectedBusinessArea, selectedDistrict]);

  // Handle filter application
  const handleFilterClick = () => {
    // Call onFilterChange with the selected values
    onFilterChange(
      selectedState, 
      selectedBusinessArea, 
      selectedDistrict, 
      selectedBlock
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedBusinessArea('');
    setSelectedDistrict('');
    setSelectedBlock('');
    onFilterChange('', '', '', '');
  };

  return (
    <div className="filter-container">
      <div className="filter-row">
        <div className="filter-field">
          <label>State:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Business Area:</label>
          <select
            value={selectedBusinessArea}
            onChange={(e) => setSelectedBusinessArea(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select Business Area</option>
            {availableBusinessAreas.map((ba) => (
              <option key={ba} value={ba}>
                {ba}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedBusinessArea}
          >
            <option value="">Select District</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-buttons">
        <button
          className="filter-apply-button"
          onClick={handleFilterClick}
          disabled={!selectedState}
        >
          Apply Filters
        </button>
        {/* <button
          className="filter-reset-button"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button> */}
      </div>
    </div>
  );
};

export default StateFilter;