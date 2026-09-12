# AnteroLive IRL Streaming Overlay

Custom browser-based overlay for mobile IRL livestreaming.

Built primarily for:

* Kick IRL streaming
* IRL Pro browser source
* Android mobile streaming
* Browser-based livestream overlays

## Features

✓ GPS-based location detection
✓ Municipality, town and village detection
✓ Country flag
✓ Live weather information
✓ Animated weather icons
✓ Battery level
✓ Mobile/network status
✓ Real-time clock
✓ Rotating social media banner
✓ Automatic `!tip` support banner
✓ Animated AnteroLive brand event
✓ Smooth fade-in and fade-out transitions
✓ Electric/cyan logo animation
✓ Responsive browser-based layout
✓ Transparent background for use as a livestream overlay

## Location

The overlay uses the device's GPS location to determine the current location.

Location detection is designed to work with municipalities, towns and smaller locations such as villages and suburbs.

The overlay also prevents unnecessary location changes caused by inaccurate GPS readings or sudden location jumps.

## Weather

Weather information is retrieved based on the accepted GPS coordinates.

The overlay displays the current temperature together with an animated weather icon.

Weather conditions include, for example:

* Clear / sunny
* Partly cloudy
* Cloudy
* Rain
* Thunderstorms
* Fog
* Snow

## Network Status

The overlay monitors the current network connection and displays the connection quality using signal bars.

Network quality is evaluated using connection information and a lightweight connectivity check.

## Social Banner

The overlay automatically rotates between social platforms:

* Instagram
* YouTube
* Kick
* TikTok

The displayed account names are part of the AnteroLive streaming brand.

## `!tip` Support Banner

The overlay can periodically display a small support message encouraging viewers to support the stream using:

`!tip`

The banner temporarily replaces the normal social media row and smoothly returns to the normal overlay afterwards.

## AnteroLive Brand Event

The overlay includes a special animated AnteroLive brand event.

At random intervals, the normal overlay information temporarily disappears and the AnteroLive logo appears in the center of the overlay.

The event includes:

* Animated AnteroLive logo
* Purple background glow
* Cyan/electric logo effect
* Smooth fade-in
* Smooth fade-out
* Automatic return to the normal overlay

The event is normally triggered randomly between 8 and 15 minutes.

## Technology

The overlay is built using:

* HTML
* CSS
* JavaScript
* SVG graphics
* GPS / Geolocation API
* Open-Meteo weather data
* Browser-based rendering

## Usage

The overlay can be hosted using GitHub Pages and added to a compatible livestreaming application as a browser source.

Current deployment:

**AnteroLive IRL Overlay**
https://anterotero123.github.io/irl-overlay/

## Version

Current version: **IRL Overlay v2.2**

## License

Personal project for AnteroLive IRL streaming.
