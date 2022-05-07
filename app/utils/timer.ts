function execute(generator, yieldValue = null) {
    let next = generator.next(yieldValue);

    if (!next.done) {
      next.value.then(
        (result) => execute(generator, result),
        (err) => generator.throw(err)
      );
    } else {
    }
  }

export default class TimerGenerator {
    private paused = false

    constructor(
        public callback: Function = async () => {},
        private readonly duration: number = 1000,
    ) {
        this.startTimer()
    }

    public startTimer() {
        this.paused = false
        execute(this.tick())
    }

    public stopTimer() {
        this.paused = true
    }

    private* tick() {
        while(true) {
            if (this.paused) return
            try {
                yield new Promise(async (resolve) => {
                        await this.callback()

                    setTimeout(resolve, this.duration);
                });
            }
            catch (e) {}
        }
    }
}
