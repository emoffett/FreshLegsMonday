# App updates
The native apps are a Trusted Web Activity (TWA) apps made from the web app (the website).
1. Complete local TODOs and checks
2. Update `Version` in the `site.webmanifest`
3. Deploy the `./static` folder to the webserver
4. Check the Chrome Lighthouse report
5. Check [PWABuilder](https://www.pwabuilder.com/reportcard?site=https://freshlegsmonday.com/)
6. Use PWABuilder to package for stores
7. Make commit(s) of any outstanding changes and push to GitHub

## Apple App Store
1. Fire up the Mac (option `Macintosh SSD`) with
```shell
sudo ./basic.sh
```
2. From the Mac use [PWABuilder](https://www.pwabuilder.com/reportcard?site=https://freshlegsmonday.com/) to generate an iOS package
   1. Set the `Bundle ID` to com.freshlegsmonday
   2. Update `App name` to `Fresh Legs Monday`
   3. Open `All Settings` and set `Image URL` to `/img/favicons/icon-apple-1024x1024.png`
   4. Follow [publishing instructions](https://docs.pwabuilder.com/#/builder/app-store?id=publishing)
   Note 1: the Apple-friendly icon should be downloaded to `~/FreshLegsMonday/static/img/favicons` with:
   ```shell
   wget https://freshlegsmonday.com/img/favicons/apple-icon-1024x1024.png
   ```
   Note 2: Project Navigator > Assets > AppIcon > App Store iOS 1024 -> change the image to the apple-icon-1024x1024.png
   Note 3: the product Archives are accessible via Window > Organizer
   5. To distribute the Archive, US English might be required, otherwise Apple will say that the app already exists...

| App Name: | FreshLegsMonday |
| - | - |
| App Version Number: | 1.0 |
| Platform: | iOS |
| App SKU: | com.freshlegsmonday |
| App Apple ID: | 6479964123 |


## Play Store
The Play Store is for Android and Chromebook Apps.

1. Use [PWABuilder](https://www.pwabuilder.com/reportcard?site=https://freshlegsmonday.com/) to generate an Android package
   1. Update `App name` to `Fresh Legs Monday`
   2. Update `Version` to that in the `site.webmanifest`
   3. Increment `Version code` compared to that in the Play Store
   4. Disable `Notification delegation`
   5. Disable `Location delegation`
   6. Set `Signing key` to `Use mine`
   7. For `Key file` upload the `android.keystore`
   8. Set `Key alias` to `android`
   9. The `Key password` and `Key store password` are in the password manager
2. Upload the .aab bundle to https://play.google.com/console/u/0/developers/
3. Chose a `Release name`
4. Write the `Release notes`
5. Click through everything
6. Update Play Store listing, e.g. screenshots

## Microsoft Store
For Windows devices

1. Use [PWABuilder](https://www.pwabuilder.com/reportcard?site=https://freshlegsmonday.com/) to generate a package
   1. Copy the IDs from [Microsoft Partner Centre](https://partner.microsoft.com/en-us/dashboard/products/9PPBNZGK4RXW/identity)
   2. `Classic app version` should be 1.0.0
   3.
