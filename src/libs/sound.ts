// Web Audio APIを使用したサウンドユーティリティ

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// タイプ音（カタカタ音 - メカニカルキーボード風）
export function playTypeSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // ノイズバッファでクリック音を生成
  const bufferSize = Math.floor(ctx.sampleRate * 0.04);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
  }

  // キーを押す音（カタの「カ」）
  const click1 = ctx.createBufferSource();
  click1.buffer = buffer;
  const bandpass1 = ctx.createBiquadFilter();
  bandpass1.type = "bandpass";
  bandpass1.frequency.setValueAtTime(3500, now);
  bandpass1.Q.setValueAtTime(1.5, now);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.35, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
  click1.connect(bandpass1);
  bandpass1.connect(gain1);
  gain1.connect(ctx.destination);
  click1.start(now);
  click1.stop(now + 0.025);

  // キーが底打ちする音（カタの「タ」）
  const click2 = ctx.createBufferSource();
  click2.buffer = buffer;
  const bandpass2 = ctx.createBiquadFilter();
  bandpass2.type = "bandpass";
  bandpass2.frequency.setValueAtTime(5000, now + 0.015);
  bandpass2.Q.setValueAtTime(2.0, now + 0.015);
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.25, now + 0.015);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
  click2.connect(bandpass2);
  bandpass2.connect(gain2);
  gain2.connect(ctx.destination);
  click2.start(now);
  click2.stop(now + 0.04);
}

// ミス音（低い音）
export function playMissSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(150, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

// 正解音（ワード完了時）
export function playCorrectSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05); // E5
  oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5

  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

// ボーナス音（派手なファンファーレ）
export function playBonusSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // 派手な上昇音
  const times = [0, 0.08, 0.16, 0.24, 0.32];
  const frequencies = [523.25, 659.25, 783.99, 987.77, 1318.51]; // C5, E5, G5, B5, E6

  times.forEach((time, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequencies[i], ctx.currentTime + time);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime + time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.25);

    oscillator.start(ctx.currentTime + time);
    oscillator.stop(ctx.currentTime + time + 0.25);
  });

  // キラキラ音を追加
  [0.1, 0.2, 0.3, 0.4].forEach((time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime + time);

    gain.gain.setValueAtTime(0.05, ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.1);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + 0.1);
  });
}

// ゲーム終了音
export function playGameEndSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const times = [0, 0.15, 0.3, 0.45];
  const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  times.forEach((time, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencies[i], ctx.currentTime + time);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime + time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.3);

    oscillator.start(ctx.currentTime + time);
    oscillator.stop(ctx.currentTime + time + 0.3);
  });
}
