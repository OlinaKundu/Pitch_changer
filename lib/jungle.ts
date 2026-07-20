export class Jungle {
  context: AudioContext;
  input: GainNode;
  output: GainNode;
  
  private shiftDownBuffer: AudioBuffer;
  private shiftUpBuffer: AudioBuffer;
  
  private mod1: AudioBufferSourceNode;
  private mod2: AudioBufferSourceNode;
  private mod3: AudioBufferSourceNode;
  private mod4: AudioBufferSourceNode;
  
  private mod1Gain: GainNode;
  private mod2Gain: GainNode;
  private mod3Gain: GainNode;
  private mod4Gain: GainNode;
  
  private modGain1: GainNode;
  private modGain2: GainNode;
  
  private fade1: AudioBufferSourceNode;
  private fade2: AudioBufferSourceNode;
  
  private mix1: GainNode;
  private mix2: GainNode;
  
  private delay1: DelayNode;
  private delay2: DelayNode;

  constructor(context: AudioContext) {
    this.context = context;
    
    const input = context.createGain();
    const output = context.createGain();
    this.input = input;
    this.output = output;

    const delayTimeVal = 0.100;
    const fadeTimeVal = 0.050;
    const bufferTimeVal = 0.100;

    // Delay modulation sources
    const mod1 = context.createBufferSource();
    const mod2 = context.createBufferSource();
    const mod3 = context.createBufferSource();
    const mod4 = context.createBufferSource();

    this.shiftDownBuffer = createDelayTimeBuffer(context, bufferTimeVal, fadeTimeVal, false);
    this.shiftUpBuffer = createDelayTimeBuffer(context, bufferTimeVal, fadeTimeVal, true);

    mod1.buffer = this.shiftDownBuffer;
    mod2.buffer = this.shiftDownBuffer;
    mod3.buffer = this.shiftUpBuffer;
    mod4.buffer = this.shiftUpBuffer;

    mod1.loop = true;
    mod2.loop = true;
    mod3.loop = true;
    mod4.loop = true;

    // Gains for oct-up/down switching
    const mod1Gain = context.createGain();
    const mod2Gain = context.createGain();
    const mod3Gain = context.createGain();
    mod3Gain.gain.value = 0;
    const mod4Gain = context.createGain();
    mod4Gain.gain.value = 0;

    mod1.connect(mod1Gain);
    mod2.connect(mod2Gain);
    mod3.connect(mod3Gain);
    mod4.connect(mod4Gain);

    // Delay gain node targets
    const modGain1 = context.createGain();
    const modGain2 = context.createGain();

    const delay1 = context.createDelay();
    const delay2 = context.createDelay();

    mod1Gain.connect(modGain1);
    mod2Gain.connect(modGain2);
    mod3Gain.connect(modGain1);
    mod4Gain.connect(modGain2);

    modGain1.connect(delay1.delayTime);
    modGain2.connect(delay2.delayTime);

    // Crossfading
    const fade1 = context.createBufferSource();
    const fade2 = context.createBufferSource();
    const fadeBuffer = createFadeBuffer(context, bufferTimeVal, fadeTimeVal);
    
    fade1.buffer = fadeBuffer;
    fade2.buffer = fadeBuffer;
    fade1.loop = true;
    fade2.loop = true;

    const mix1 = context.createGain();
    const mix2 = context.createGain();
    mix1.gain.value = 0;
    mix2.gain.value = 0;

    fade1.connect(mix1.gain);
    fade2.connect(mix2.gain);

    // Connect graph
    input.connect(delay1);
    input.connect(delay2);
    delay1.connect(mix1);
    delay2.connect(mix2);
    mix1.connect(output);
    mix2.connect(output);

    // Start playback
    const t = context.currentTime + 0.050;
    const t2 = t + bufferTimeVal - fadeTimeVal;

    mod1.start(t);
    mod2.start(t2);
    mod3.start(t);
    mod4.start(t2);
    fade1.start(t);
    fade2.start(t2);

    this.mod1 = mod1;
    this.mod2 = mod2;
    this.mod3 = mod3;
    this.mod4 = mod4;
    this.mod1Gain = mod1Gain;
    this.mod2Gain = mod2Gain;
    this.mod3Gain = mod3Gain;
    this.mod4Gain = mod4Gain;
    this.modGain1 = modGain1;
    this.modGain2 = modGain2;
    this.fade1 = fade1;
    this.fade2 = fade2;
    this.mix1 = mix1;
    this.mix2 = mix2;
    this.delay1 = delay1;
    this.delay2 = delay2;

    this.setDelay(delayTimeVal);
  }

  setDelay(delayTime: number) {
    this.modGain1.gain.setTargetAtTime(0.5 * delayTime, this.context.currentTime, 0.010);
    this.modGain2.gain.setTargetAtTime(0.5 * delayTime, this.context.currentTime, 0.010);
  }

  setPitchOffset(mult: number) {
    const delayTimeVal = 0.100;
    if (mult > 0) { // pitch up
      this.mod1Gain.gain.value = 0;
      this.mod2Gain.gain.value = 0;
      this.mod3Gain.gain.value = 1;
      this.mod4Gain.gain.value = 1;
    } else { // pitch down
      this.mod1Gain.gain.value = 1;
      this.mod2Gain.gain.value = 1;
      this.mod3Gain.gain.value = 0;
      this.mod4Gain.gain.value = 0;
    }
    this.setDelay(delayTimeVal * Math.abs(mult));
  }

  disconnect() {
    try {
      this.mod1.stop();
      this.mod2.stop();
      this.mod3.stop();
      this.mod4.stop();
      this.fade1.stop();
      this.fade2.stop();
    } catch {
      // already stopped or not started
    }
    try {
      this.input.disconnect();
      this.output.disconnect();
      this.mod1Gain.disconnect();
      this.mod2Gain.disconnect();
      this.mod3Gain.disconnect();
      this.mod4Gain.disconnect();
      this.modGain1.disconnect();
      this.modGain2.disconnect();
      this.delay1.disconnect();
      this.delay2.disconnect();
      this.mix1.disconnect();
      this.mix2.disconnect();
    } catch {
      // error disconnecting
    }
  }
}

function createFadeBuffer(context: AudioContext, activeTime: number, fadeTime: number): AudioBuffer {
  const length1 = activeTime * context.sampleRate;
  const length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
  const length = length1 + length2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const p = buffer.getChannelData(0);

  const fadeLength = fadeTime * context.sampleRate;
  const fadeIndex1 = fadeLength;
  const fadeIndex2 = length1 - fadeLength;

  for (let i = 0; i < length1; ++i) {
    let value: number;
    if (i < fadeIndex1) {
      value = Math.sqrt(i / fadeLength);
    } else if (i >= fadeIndex2) {
      value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
    } else {
      value = 1;
    }
    p[i] = value;
  }

  for (let i = length1; i < length; ++i) {
    p[i] = 0;
  }

  return buffer;
}

function createDelayTimeBuffer(
  context: AudioContext,
  activeTime: number,
  fadeTime: number,
  shiftUp: boolean
): AudioBuffer {
  const length1 = activeTime * context.sampleRate;
  const length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
  const length = length1 + length2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const p = buffer.getChannelData(0);

  for (let i = 0; i < length1; ++i) {
    if (shiftUp) {
      p[i] = (length1 - i) / length;
    } else {
      p[i] = i / length1;
    }
  }

  for (let i = length1; i < length; ++i) {
    p[i] = 0;
  }

  return buffer;
}
