const fs = require("fs");
const crypto = require("crypto");

/****** 第一種 ******/

// 1. 優先執行top level code
// 2. 因為另外三個function都沒有放在callback function裏面,
// 因此這三個函式都不是在 Event loop 裡面執行
// 所以執行沒有特定的順序

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
});

console.log("Hello from the top level code");

/****** 第二種 ******/
// 結果：
// Hello from the top level code
// Timer 1 finished
// Immediate 1 finished
// I/O finished
// --------------
// Immediate 2 finished
// Timer 2 finished
// Timer 3 finished

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("--------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished"));
});

console.log("Hello from the top level code");

/****** 第三種 ******/
// 結果：
// Hello from the top level code
// Timer 1 finished
// Immediate 1 finished
// I/O finished
// --------------
// Process.nextTick ---> next tick is part of the microtasks queue, which get executed after each phase
// Immediate 2 finished
// Timer 2 finished
// Timer 3 finished

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("--------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished"));

  // When we pass a function to process.nextTick(), we instruct the engine to invoke this function at the end of the current operation, before the next event loop tick starts
  process.nextTick(() => console.log("Process.nextTick"));
});

console.log("Hello from the top level code");

/****** thread pool示範 1 ********/
// 結果：
// Hello from the top level code
// Timer 1 finished
// Immediate 1 finished
// I/O finished
// --------------
// Process.nextTick
// Immediate 2 finished
// Timer 2 finished
// 585 Password encrypted   ---> defualt 設定有 4 個 thread pool 所以四個 encrypt 同時進行，因此四個encrypt完成的時間一樣
// 587 Password encrypted   ---> defualt 設定有 4 個 thread pool 所以四個 encrypt 同時進行，因此四個encrypt完成的時間一樣
// 596 Password encrypted   ---> defualt 設定有 4 個 thread pool 所以四個 encrypt 同時進行，因此四個encrypt完成的時間一樣
// 598 Password encrypted   ---> defualt 設定有 4 個 thread pool 所以四個 encrypt 同時進行，因此四個encrypt完成的時間一樣
// Timer 3 finished

const start = Date.now();

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("--------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished"));

  // When we pass a function to process.nextTick(), we instruct the engine to invoke this function at the end of the current operation, before the next event loop tick starts
  process.nextTick(() => console.log("Process.nextTick"));

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
});

console.log("Hello from the top level code");

/****** thread pool示範 2 ********/
// 結果：
// Hello from the top level code
// Timer 1 finished
// Immediate 1 finished
// I/O finished
// --------------
// Process.nextTick
// Immediate 2 finished
// Timer 2 finished
// 549 Password encrypted
// 1084 Password encrypted ---> 當設定成只有一個thread pool所以四個encrypt無法同時進行，而是一個接著一個由一個thread pool做encrypt
// 1620 Password encrypted
// 2153 Password encrypted
// Timer 3 finished

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1; // defualt thread pool size is 4

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("--------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished"));

  // When we pass a function to process.nextTick(), we instruct the engine to invoke this function at the end of the current operation, before the next event loop tick starts
  process.nextTick(() => console.log("Process.nextTick"));

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
});

console.log("Hello from the top level code");


/****** thread pool示範 3 ********/
// 如果使用sync type encrypt則會block整個event-loop
// 結果：
// Hello from the top level code
// Timer 1 finished
// Immediate 1 finished
// I/O finished
// --------------
// 551 Password encrypted --> 如果使用sync type encrypt則會block整個event-loop
// 1091 Password encrypted --> 如果使用sync type encrypt則會block整個event-loop
// 1629 Password encrypted --> 如果使用sync type encrypt則會block整個event-loop
// 2166 Password encrypted --> 如果使用sync type encrypt則會block整個event-loop
// Process.nextTick
// Immediate 2 finished
// Timer 2 finished
// Timer 3 finished

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1; // defualt thread pool size is 4

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("--------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished"));

  // When we pass a function to process.nextTick(), we instruct the engine to invoke this function at the end of the current operation, before the next event loop tick starts
  process.nextTick(() => console.log("Process.nextTick"));

  // belows these four password encryptions will no longer run in the event loop.
  // And so they will no longer be offloaded to the thread pool.
  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted");

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted");

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted");

  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted");
});

console.log("Hello from the top level code");
