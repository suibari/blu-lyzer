import { getPostsLikesAndUpdateDbFunction, analyzeRecordsFunction } from "./function";

export const functions = [
  // getElementsAndUpdateDbFunction,
  getPostsLikesAndUpdateDbFunction(0), // elements  [0] ~ [19]
  getPostsLikesAndUpdateDbFunction(1), //          [20] ~ [38]
  analyzeRecordsFunction,
];

export { inngest } from './inngest'
