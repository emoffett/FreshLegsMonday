# App updates
The native apps are a Trusted Web Activity (TWA) apps made from the web app (the website).
1. Complete local TODOs and checks
2. Update `Version` in the `site.webmanifest`
3. Deploy the `./static` folder to the webserver
4. Check the Chrome Lighthouse report
5. Check [PWABuilder](https://www.pwabuilder.com/reportcard?site=https://freshlegsmonday.com/)
6. Use PWABuilder to package for stores
7. Make commit(s) of any outstanding changes and push to GitHub

## Play Store App
The Play Store is for Android and Chromebook Apps.

1. Use [PWABuilder](https://www.pwabuilder.com/reportcard?site=https://freshlegsmonday.com/) to generate an Android package
   1. Update `App name` to `Fresh Legs Monday`
   2. Update `Version` to that in the `site.webmanifest`
   3. Increment `Version code` compared to that in the Play Store
   4. Set `Splash fade out duration (ms)` to "150"
   5. Disable `Notification delegation`
   6. Disable `Location delegation`
   7. Set `Signing key` to `Use mine`
   8. For `Key file` upload the `android.keystore`
   9. Set `Key alias` to `android`
   10. The `Key password` and `Key store password` are in the password manager
2. Upload the .aab bundle to https://play.google.com/console/u/0/developers/
3. Chose a `Release name`
4. Write the `Release notes`
5. Click through everything
6. Update Play Store listing, e.g. screenshots
