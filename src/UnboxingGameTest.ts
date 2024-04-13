const fs = require ('fs');
const SHA256 = require ('crypto-js/sha256');
const hmacSHA512 = require ('crypto-js/hmac-sha512');

export default class UnboxingGameTest {
  private readonly HASH_TRIM_LENGTH = 8;
  private boxContent: any;
  private readonly randomMaxValue = 2 ** (this.HASH_TRIM_LENGTH * 4);
  private readonly pointValue = Math.floor(this.randomMaxValue / 100);
  private randoms: any = {};
  private openingResults: any = {};
  private winningSum = 0;

  constructor (boxName: string, openings: number) {
    try {
      const data = fs.readFileSync (`./src/boxes/${ boxName }.json`, 'utf8');
      const boxContent = JSON.parse (data);
      boxContent.items = boxContent.items.map ((item: any) => {
        item.winnings = 0;
        item.id = this.stringToHash (item.name);

        return item;
      });

      boxContent.totalSpentSum = openings * boxContent.unboxing_price;
      this.boxContent = boxContent;

    } catch (err) {
      console.error (`Error reading box file: ${ boxName }`);
    }
  }

  private stringToHash (string: string) {
    let hash = 0;
    if (string.length == 0) {

      return hash
    }

    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt (i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs (hash);
  }

  private getRandomValue (nonce: number): number {
    const str = Math.random ().toString ();
    const serverSeed = SHA256 (str).toString ();
    const clientSeed = SHA256 (str).toString ();
    const key = serverSeed + clientSeed + nonce;
    const hmac = hmacSHA512 (key, serverSeed).toString ().slice (0, this.HASH_TRIM_LENGTH);

    return parseInt (hmac, 16);
  }

  private pushRandom (randomValue: number) {
    if (!this.randoms[randomValue]) {
      this.randoms[randomValue] = 1;
    } else {
      this.randoms[randomValue]++;
    }
  }

  public openBox () {
    const randomValue = this.getRandomValue (this.randomMaxValue);
    this.pushRandom (randomValue);
    const shuffledItems = this.boxContent.items.sort (() => Math.random () - 0.5);
    let seek = randomValue;
    let itemIndex = 0;
    while (seek > 0 && itemIndex < shuffledItems.length){
      const delta = shuffledItems[itemIndex].win_chance * this.pointValue
      seek -= shuffledItems[itemIndex].win_chance * this.pointValue;
      itemIndex++;
    }
    let winningItem = shuffledItems[itemIndex - 1];

    if(!this.openingResults[winningItem.id]){
      this.openingResults[winningItem.id] = 1;
    } else {
      this.openingResults[winningItem.id]++;
    }

    this.winningSum += Number(winningItem.price.toFixed(2));

    return winningItem;
  }

  public getRepeatedRandoms () {
    const repeatedRandoms = [];
    for (const key in this.randoms) {
      if (this.randoms[key] > 1) {
        repeatedRandoms.push ({
          value: key,
          times: this.randoms[key],
        })
      }
    }

    return repeatedRandoms;
  }

  public getOpeningResults (totalOpenings: number = 0) {
    return  this.boxContent.items.map ((item: any) => {
      return {
        name: item.name,
        price: item.price,
        winnings: this.openingResults[item.id] || 0,
        win_chance: item.win_chance,
        real_win_rate: Number(((this.openingResults[item.id] || 0) / totalOpenings * 100).toFixed(2)),
      }
    })
  }

  public get totalSpentSum () {
    return this.boxContent.totalSpentSum;
  }

  public get totalWinningSum () {
    return this.winningSum;
  }
}