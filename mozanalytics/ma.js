(function () {
  // Mozilla Analytics. Send data to the Mozilla Generic Ingestion Service.
  const ENDPOINT_URL = "https://telemetry.mozilla.org/generic/";

  let _enabled = navigator.doNotTrack != '1'; // Respect DNT
  let _monotonicStart = window.performance.now();
  let _failures = 0;

  if (_enabled && !('sendBeacon' in window.navigator)) {
    console.error('ma - unable to send beacons.');
    _enabled = false;
  }

  let _buildPayload = (method, object, value, extra) => {
    return {
      timestamp: Math.floor(window.performance.now() - _monotonicStart),
      category: 'ma',
      method,
      object,
      value,
      extra,
    };
  };

  let _buildUrl = () => {
    // TODO - what is the endpoint, anyway?
    return ENDPOINT_URL;
  };

  window.ma = {
    // We're aping the Telemetry Events spec:
    // https://firefox-source-docs.mozilla.org/toolkit/components/telemetry/telemetry/collection/events.html
    send: function (method, object, value = null, extra = null) {
      if (!_enabled) {
        return;
      }
      let success = window.navigator.sendBeacon(_buildUrl(), _buildPayload(method, object, value, extra));
      if (!success && _failures < 3) { // Don't spam the log more than thrice
        _failures++;
        console.warn('ma - unable to queue beacon. Oh well. Dropping event on the floor.');
      }
    },
  };
})();
