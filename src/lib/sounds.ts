export type SoundName =
    | 'move'
    | 'capture'
    | 'check'
    | 'castle'
    | 'promote'
    | 'gameStart'
    | 'gameEnd'
    | 'illegal'
    | 'notify';

const SOUND_FILES: Record<SoundName, string> = {
    move: '/sounds/move-self.mp3',
    capture: '/sounds/capture.mp3',
    check: '/sounds/move-check.mp3',
    castle: '/sounds/castle.mp3',
    promote: '/sounds/promote.mp3',
    gameStart: '/sounds/game-start.mp3',
    gameEnd: '/sounds/game-end.mp3',
    illegal: '/sounds/illegal.mp3',
    notify: '/sounds/notify.mp3',
};

class SoundManager {
    private sounds: Map<SoundName, HTMLAudioElement> = new Map();
    private _enabled: boolean = true;
    private initialized: boolean = false;

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    init() {
        if (this.initialized || typeof window === 'undefined') return;
        this.initialized = true;

        Object.entries(SOUND_FILES).forEach(([name, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = 0.6;
            this.sounds.set(name as SoundName, audio);
        });
    }

    play(name: SoundName) {
        if (!this._enabled) return;
        this.init();

        const sound = this.sounds.get(name);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {
                // Autoplay blocked, silent fail
            });
        }
    }

    toggle() {
        this._enabled = !this._enabled;
        return this._enabled;
    }
}

export const soundManager = new SoundManager();
