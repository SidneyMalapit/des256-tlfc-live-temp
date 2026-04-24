export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

if (!API_ENDPOINT) { throw Error('could not find API_ENDPOINT; set in environent variables'); }

export class FridgeData {
  constructor(
    public readonly name: string,
    public readonly temperature: number,
    public readonly lastUpdated: Date
  ) {}

  get temperatureCelsius() { return Math.round((this.temperature - 32) * 5 / 9); }
}

const fridgeResponseExtractor = /^([ -{}~]+)\|(-?\d+(?:\.\d+)?)\|(\d+)/;
export function deserialize(encodedFridgeData: string) {
  const [
    _,
    name,
    temperature,
    lastUpdatedTimestamp
  ] = fridgeResponseExtractor.exec(encodedFridgeData) ?? [null, null, null];
  if (name && temperature && lastUpdatedTimestamp) {
    return new FridgeData(
      name,
      parseFloat(temperature),
      new Date(1000 * parseInt(lastUpdatedTimestamp))
    );
  }
  throw Error(`could not deserialize fridge data: ${encodedFridgeData}`);
}

export async function getAllTemperatures() {
  const response = await fetch(API_ENDPOINT + '/temp/all');
  if (!response.ok) { throw Error('could not fetch fridge temperatures'); }
  return (await response.text()).trim().split(/\r?\n/).map(deserialize);
}
