"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function execute(generator, yieldValue = null) {
    let next = generator.next(yieldValue);
    if (!next.done) {
        next.value.then((result) => execute(generator, result), (err) => generator.throw(err));
    }
    else {
    }
}
class TimerGenerator {
    constructor(callback = () => __awaiter(this, void 0, void 0, function* () { }), duration = 1000) {
        this.callback = callback;
        this.duration = duration;
        this.paused = false;
        this.startTimer();
    }
    startTimer() {
        this.paused = false;
        execute(this.tick());
    }
    stopTimer() {
        this.paused = true;
    }
    *tick() {
        while (true) {
            if (this.paused)
                return;
            try {
                yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    yield this.callback();
                    setTimeout(resolve, this.duration);
                }));
            }
            catch (e) { }
        }
    }
}
exports.default = TimerGenerator;
//# sourceMappingURL=timer.js.map