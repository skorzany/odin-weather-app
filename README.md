# odin-weather-app

Weather app made as part of the Odin Project fullstack JavaScript course.<br/>
Check it out on [GitHub Pages](https://skorzany.github.io/odin-weather-app/).<br/><br/>
It was a good hands-on practice of working with APIs and <em>asynchronous code</em>.<br/>
Powered by [VisualCrossing Weather API](https://www.visualcrossing.com/weather-api/).<br/><br/>
Project specification asked for basic functionality: view some weather data<br/>
for a location provided by user. But, as a challenge, I went ahead and coded more<br/>
additional features, including:

- viewing data in different units, (metric or US system)
- option for using device's geolocation instead of manually typed one,
- animated spinner & useful status messages,
- dates displayed in user's local format,
- detailed view of current weather in form of a neat card,<br/>
  (including over 20 different icons for different conditions)
- a 3-day (less detailed) forecast for provided location,
- the card and forecast are separate, meaning that you could easily change<br/>
  the project layout for your needs.
  <!---->
  All in vanilla JavaScript, wrapped into classes, following an MVC design pattern.

## Additional notes

- The page layout was designed for desktop exclusively!<br/>
- I'm aware that my weather API key is exposed but that's okay for this project,
- The 'use my location' feature is called 'experimental', as currently it<br/>
  provides coordinates only. Converting these into real location name<br/>
  wouldn't be hard, but it requires additional API key that I have no need for now,
- The geolocation component is allowed to <em>always</em> use cached coordinates<br/>
  for performance reasons (changing it would be easy, though). Please keep that in mind!

I hope that you like it!
