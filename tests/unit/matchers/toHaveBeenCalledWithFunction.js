import { matcherHint, printReceived } from 'jest-matcher-utils';

export default function toHaveBeenCalledWithFunction(expected, fn, testcases = []) {

  const predicate = (transaction, fn, testcases) => {
    const isFunction = typeof expected === 'function';
    return isFunction && testcases.every(test => {
      // console.log(fn(test), "===", transaction(test))
      return fn(test) === transaction(test);
    });
  }

  const transaction = expected.mock.calls[0][0];
  const pass = predicate(transaction, fn, testcases);

  const passMessage = received => () =>
    matcherHint('.not.toHaveBeenCalledWithFunction', 'received', '')
    + '\n\n'
    + 'Expected value to not be a function, received:\n'
    + `  ${printReceived(received)}`;

  const failMessage = received => () =>
    matcherHint('.toHaveBeenCalledWithFunction', 'received', '')
    + '\n\n'
    + 'Expected to receive a function, received:\n'
    + `  ${printReceived(received)}`;

  if (pass) {
    return { pass: true, message: passMessage(transaction) };
  }

  return { pass: false, message: failMessage(transaction) };
}

expect.extend({ toHaveBeenCalledWithFunction });
