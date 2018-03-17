export function getRandomInt(): number {
  let maxNum = new Date().getTime();
  return maxNum + Math.floor(Math.random() * maxNum);
}

export function getRandomIntByRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
