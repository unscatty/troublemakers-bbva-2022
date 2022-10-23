// eslint-disable-next-line no-unused-vars
export const findLast = <T>(array: T[], condition: (element: T) => boolean) => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (condition(array[i])) {
      return array[i]
    }
  }
}
