'use strict';

module.exports.timestamp_to_date = function(timestamp) {
    return new Date(timestamp * 1000); // Convert from seconds to milliseconds
}
