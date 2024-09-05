# rally.tv

https://www.rally.tv/tv-guide

### Download the guide

```sh
npm run grab -- --site=rally.tv
```

### Update channel list

```sh
npm run channels:parse -- --config=./sites/rally.tv/rally.tv.config.js --output=./sites/rally.tv/rally.tv.channels.xml
```

### Test

```sh
npm test -- rally.tv
```
