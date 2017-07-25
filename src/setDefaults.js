export default function (o, defaults) {
  for (let key of Object.keys(defaults)) {
    if (!(key in o) || o[key] === undefined || o[key] === null) {
      o[key] = defaults[key]
    }
  }
}
