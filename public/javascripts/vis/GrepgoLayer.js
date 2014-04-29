/*
 * Class calls indicators API, and sets tile url to match time limit and location
 *
 * TODO: make another, abstract class, to make choosing between
 * TODO: stop using `var self = this`, find official Leaflet way to do this !!!!!!!!!!! 
 * client-side/server-side classification/binning and rendering abstract/transparent
 */

L.GrepgoLayer = L.TileLayer.extend({

  options: {
    timeLimit: 120  
  },
  
  initialize: function (endpoint, options) {
    this._endpoint = endpoint;
    this._timeLimit = options.timeLimit;
    
    // TODO: Get default indicator and attribute from options
    
    options = L.setOptions(this, options);
  },
  
  addTo: function (map) {
    var self = this;
    
    self._location = map.getCenter();
    
    // First, get server metadata
    self._getMetadata(function(metadata) {
      // TODO: use metadata lat/lon?
      self._maxTimeLimit = metadata.maxTimeLimit;
      self.fireEvent('maxtime', {maxTimeLimit: self._maxTimeLimit});
    });
    
    // In parallel, get indicator metadata
    self._getIndicatorMetadata(function(json) {
      
      self._indicatorMetadata = json;
      if (!self._indicatorId) {
        for (var indicatorId in self._indicatorMetadata) {
          break;
        }
        self._indicatorId = indicatorId;
      }
      
      // Use self._location to build spatial query
      self._getSpatialQuery(self._location, function(sptId) {  
        
        self._setSptId(sptId, function() {
          map.addLayer(self);  
        });        
        
      });      
    });
    
    // When layer is added to map, also add LocationLayer
    // TODO: remove locationlayer when this layer is removed!
    self._locationLayer = L.locationLayer(map.getCenter())
        .on('dragend', function(e) {
          self.setLocation(e.target._latlng);
        }).addTo(map);    
    
    return self;
  },
  
  setLocation: function (latlng) {
    var self = this;
    
    self._location = latlng;
    
    self._getSpatialQuery(self._location, function(sptId) {
      self._setSptId(sptId, function() {
        
      });
    });
    
  },
  
  getIndicatorId: function () {
    return this._indicatorId;
  },
  
  setIndicatorId: function (indicatorId) {
    var self = this;
    self._indicatorId = indicatorId;
    self._setView(self._indicatorId, self._timeLimit);
  },

  setTimeLimit: function (timeLimit) {
    var self = this;
    if (self._sptId && self._indicatorId) {
      self._timeLimit = timeLimit;
      self._setView(self._indicatorId, self._timeLimit);
    }
  },
  
  getIndicatorMetadata: function () {
    return this._indicatorMetadata;
  },
  
  getIndicator: function (indicator) {
    var self = this;
    
    // TODO: make sure 
    // self._indicators[self._indicatorId][self._maxTimeLimit]
    // and
    // this._indicators[this._indicatorId][this._timeLimit]
    // exist!
    
    if (!indicator) {
      indicator = self._indicatorId;
    }
    
    var indicator = [];
    if (self._indicators[self._indicatorId][self._maxTimeLimit] && 
      self._indicators[self._indicatorId][self._timeLimit]) {
        
      // TODO: remove jobpct hack!
      var o = {};
      self._indicators[self._indicatorId][self._maxTimeLimit].attributes.forEach(function(attribute) {
        if (attribute.id != 'jobpct') {

          var name = '';
          // TODO: use traditional for with break
          self._indicatorMetadata[self._indicatorId].forEach(function(metadata) {
            if (metadata.id == attribute.id) {
              name = metadata.name;
            }
          });
      
          o[attribute.id] = {
            id: attribute.id,
            name: name,
            total: attribute.total
          };  
        }
      });

      self._indicators[self._indicatorId][self._timeLimit].attributes.forEach(function(attribute) {
        if (attribute.id != 'jobpct') {
          o[attribute.id].value = attribute.total;
        }
      });
  
      var indicator = [];
      for(var i in o) {
          indicator.push(o[i]);
      }
    }
    return indicator;      
  },
  
  getAttribute: function (indicator, attribute) {
    
  },
  
  _setView: function (indicatorId, timeLimit, callback) {
    var self = this;
    
    // If no callback is specified, use default callback which
    // fires change event
    if (!callback) {
      callback = function(indicator) {
        self.fireEvent('change');
      }
    }
    
    // Set tile url
    var url = self._endpoint + self._getTilePath(self._sptId, indicatorId, timeLimit)
  
    // TODO: remove when tile api works
    var url = 'https://{s}.tiles.mapbox.com/v3/conveyal.hm3g7764/{z}/{x}/{y}.png';
    self.setUrl(url);

    // getIndicator for current default timeLimit
    self._getIndicator(self._sptId, indicatorId, timeLimit, callback);
  },
  
  _setSptId: function (sptId, callback) {
    var self = this;
    
    // Empty internal indicator cache
    self._indicators = null;
    
    self._sptId = sptId;
      
    // TODO: make sure change event is only fired after both this call
    // and possible _setView call are finished
    self._sptId = sptId;
    self._setView(self._indicatorId, self._timeLimit, function() {
    
      if (self._timeLimit != self._maxTimeLimit) {
        // Get indicator data for maxTimeLimit, but skip firing change event
        self._setView(self._indicatorId, self._maxTimeLimit, function() {
          self.fireEvent('change');
          callback();
        }); 
      } else {
        self.fireEvent('change');
        callback();
      }  
    });  
    
  },
  
  _getSpatialQuery: function(location, callback) {
    var path = 'spt?'
        + 'lat=' + location.lat + '&'
        + 'lon=' + location.lng;
    this._getJSON(path, function(json) {
      if (json && json.sptId) {
        callback(json.sptId);
      }
    });    
  },

  _getIndicator: function(sptId, indicatorId, timeLimit, callback) {
    var self = this;
    
    // Check first if indicatorId/timeLimit exists
    // in indicator cache
    if (self._indicators && self._indicators[indicatorId] && self._indicators[indicatorId][timeLimit]) {
      callback(self._indicators[indicatorId][timeLimit]);
    } else {
      var path = 'indicator?' 
          + 'indicatorId=' + indicatorId + '&'
          + 'sptId=' + sptId + '&'
          + 'timeLimit=' + timeLimit;          
      this._getJSON(path, function(json) {
        // TODO: support multiple indicators in one call!
        if (json && json.indicators && json.indicators.length) {
          var indicator = json.indicators[0];
        
          if (!self._indicators) {
            self._indicators = {};
          }
          if (!self._indicators[indicatorId]) {
            self._indicators[indicatorId] = {};
          }
        
          self._indicators[indicatorId][timeLimit] = indicator;
          callback(indicator); 
        }
      });
    }
  },
  
  _getMetadata: function(callback) {
    var path = 'metadata';
    this._getJSON(path, callback);
  },

  _getIndicatorMetadata: function (callback) {
    var path = 'indicatorMetadata';
    this._getJSON(path, callback);
  },
  
  _getJSON: function(path, callback) {
    d3.json(this._endpoint + path, callback);
  },
  
  _getTilePath: function(sptId, indicatorId, timeLimit) {
    var path = 'tiles/' 
        + sptId 
        + '/'
        + indicatorId
        + '/'
        + timeLimit
        + '/{z}/{x}/{y}.png';
    return path;
  }  

});

L.grepgoLayer = function (url, options) {
  return new L.GrepgoLayer(url, options);
};