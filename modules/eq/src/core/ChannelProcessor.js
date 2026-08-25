// ================================================================
// CHANNEL PROCESSOR — обработка каналов (Stereo, Mid, Side, Left, Right)
// ================================================================

export default class ChannelProcessor {
    constructor(ctx, band, state) {
        this.ctx = ctx;
        this.band = band;
        this.state = state;
        this.mode = band.channelMode || 'stereo';
        this.nodes = [];
        this.inputNode = null;
        this.outputNode = null;
        this.filter = null;
        this.filterMid = null;
        this.filterSide = null;
        this.filterL = null;
        this.filterR = null;
        this._dynamicsController = null;
        this._hasDynamic = false;
        this._dynGainNodes = [];
        this._midMerger = null;
        this._sideMerger = null;
        this._midSum = null;
        this._sideSum = null;
        this._splitter = null;
        this._merger = null;
        this.buildChain();
        this.updateParams();
    }

    _mkDynGain() {
        const g = this.ctx.createGain();
        g.gain.value = 1.0;
        this.nodes.push(g);
        return g;
    }

    buildChain() {
        this._destroyNodes();
        this.nodes = [];
        this._dynamicsController = null;
        this._hasDynamic = false;
        this._dynGainNodes = [];
        switch(this.mode) {
            case 'stereo': this._buildStereo(); break;
            case 'mid': this._buildMid(); break;
            case 'side': this._buildSide(); break;
            case 'left': this._buildLeft(); break;
            case 'right': this._buildRight(); break;
            default: this._buildStereo();
        }
    }

    _destroyNodes() {
        for (const node of this.nodes) {
            try {
                if (node.disconnect) node.disconnect();
                if (node.stop) node.stop();
            } catch(e) {}
        }
        this.nodes = [];
    }

    _buildStereo() {
        this.filter = this.ctx.createBiquadFilter();
        const dyn = this._mkDynGain();
        this.nodes.push(this.filter);
        this._dynGainNodes = [dyn];
        this.filter.connect(dyn);
        this.inputNode = this.filter;
        this.outputNode = dyn;
    }

    _buildMid() {
        const splitter = this.ctx.createChannelSplitter(2);
        this.nodes.push(splitter);
        this._splitter = splitter;

        const midL = this.ctx.createGain();
        midL.gain.value = 0.5;
        const midR = this.ctx.createGain();
        midR.gain.value = 0.5;
        const midSum = this.ctx.createGain();
        this.nodes.push(midL, midR, midSum);
        splitter.connect(midL, 0);
        splitter.connect(midR, 1);
        midL.connect(midSum);
        midR.connect(midSum);

        const sideL = this.ctx.createGain();
        sideL.gain.value = 0.5;
        const sideR = this.ctx.createGain();
        sideR.gain.value = -0.5;
        const sideSum = this.ctx.createGain();
        this.nodes.push(sideL, sideR, sideSum);
        splitter.connect(sideL, 0);
        splitter.connect(sideR, 1);
        sideL.connect(sideSum);
        sideR.connect(sideSum);

        this.filterMid = this.ctx.createBiquadFilter();
        const dyn = this._mkDynGain();
        this.nodes.push(this.filterMid);
        this._dynGainNodes = [dyn];
        midSum.connect(this.filterMid);
        this.filterMid.connect(dyn);

        const merger = this.ctx.createChannelMerger(2);
        this.nodes.push(merger);
        this._midMerger = merger;

        const leftSum = this.ctx.createGain();
        leftSum.gain.value = 1;
        const rightSum = this.ctx.createGain();
        rightSum.gain.value = 1;
        this.nodes.push(leftSum, rightSum);

        dyn.connect(leftSum);
        dyn.connect(rightSum);

        const sideGain = this.ctx.createGain();
        sideGain.gain.value = 1;
        this.nodes.push(sideGain);
        sideSum.connect(sideGain);
        sideGain.connect(leftSum);

        const invertSide = this.ctx.createGain();
        invertSide.gain.value = -1;
        this.nodes.push(invertSide);
        sideGain.connect(invertSide);
        invertSide.connect(rightSum);

        leftSum.connect(merger, 0, 0);
        rightSum.connect(merger, 0, 1);

        this.inputNode = splitter;
        this.outputNode = merger;
    }

    _buildSide() {
        const splitter = this.ctx.createChannelSplitter(2);
        this.nodes.push(splitter);
        this._splitter = splitter;

        const midL = this.ctx.createGain();
        midL.gain.value = 0.5;
        const midR = this.ctx.createGain();
        midR.gain.value = 0.5;
        const midSum = this.ctx.createGain();
        this.nodes.push(midL, midR, midSum);
        splitter.connect(midL, 0);
        splitter.connect(midR, 1);
        midL.connect(midSum);
        midR.connect(midSum);

        const sideL = this.ctx.createGain();
        sideL.gain.value = 0.5;
        const sideR = this.ctx.createGain();
        sideR.gain.value = -0.5;
        const sideSum = this.ctx.createGain();
        this.nodes.push(sideL, sideR, sideSum);
        this._sideSum = sideSum;
        splitter.connect(sideL, 0);
        splitter.connect(sideR, 1);
        sideL.connect(sideSum);
        sideR.connect(sideSum);

        this.filterSide = this.ctx.createBiquadFilter();
        const dyn = this._mkDynGain();
        this.nodes.push(this.filterSide);
        this._dynGainNodes = [dyn];
        sideSum.connect(this.filterSide);
        this.filterSide.connect(dyn);

        const merger = this.ctx.createChannelMerger(2);
        this.nodes.push(merger);
        this._sideMerger = merger;

        const leftSum = this.ctx.createGain();
        leftSum.gain.value = 1;
        const rightSum = this.ctx.createGain();
        rightSum.gain.value = 1;
        this.nodes.push(leftSum, rightSum);

        midSum.connect(leftSum);
        midSum.connect(rightSum);

        dyn.connect(leftSum);

        const invertSide = this.ctx.createGain();
        invertSide.gain.value = -1;
        this.nodes.push(invertSide);
        dyn.connect(invertSide);
        invertSide.connect(rightSum);

        leftSum.connect(merger, 0, 0);
        rightSum.connect(merger, 0, 1);

        this.inputNode = splitter;
        this.outputNode = merger;
    }

    _buildLeft() {
        const splitter = this.ctx.createChannelSplitter(2);
        this.nodes.push(splitter);

        this.filterL = this.ctx.createBiquadFilter();
        const dyn = this._mkDynGain();
        this.nodes.push(this.filterL);
        this._dynGainNodes = [dyn];

        const merger = this.ctx.createChannelMerger(2);
        this.nodes.push(merger);

        splitter.connect(this.filterL, 0);
        this.filterL.connect(dyn);
        dyn.connect(merger, 0, 0);

        splitter.connect(merger, 1, 1);

        this.inputNode = splitter;
        this.outputNode = merger;
    }

    _buildRight() {
        const splitter = this.ctx.createChannelSplitter(2);
        this.nodes.push(splitter);

        this.filterR = this.ctx.createBiquadFilter();
        const dyn = this._mkDynGain();
        this.nodes.push(this.filterR);
        this._dynGainNodes = [dyn];

        const merger = this.ctx.createChannelMerger(2);
        this.nodes.push(merger);

        splitter.connect(merger, 0, 0);

        splitter.connect(this.filterR, 1);
        this.filterR.connect(dyn);
        dyn.connect(merger, 0, 1);

        this.inputNode = splitter;
        this.outputNode = merger;
    }

    updateParams() {
        const band = this.band;
        const typeMap = {
            bell:'peaking', lowshelf:'lowshelf', highshelf:'highshelf',
            lowcut:'highpass', highcut:'lowpass', notch:'notch', bandpass:'bandpass'
        };
        const type = typeMap[band.type] || 'peaking';
        const freq = band.freq;
        const q = band.q;
        const now = this.ctx.currentTime;
        const time = 0.03;

        let gainVal = 0, midGainVal = 0, sideGainVal = 0, leftGainVal = 0, rightGainVal = 0;
        switch(this.mode) {
            case 'stereo': gainVal = band.gain || 0; break;
            case 'mid': midGainVal = band.midGain || 0; break;
            case 'side': sideGainVal = band.sideGain || 0; break;
            case 'left': leftGainVal = band.leftGain || 0; break;
            case 'right': rightGainVal = band.rightGain || 0; break;
            default: gainVal = band.gain || 0;
        }

        if (this.mode === 'stereo' && this.filter) {
            this._setFilterParams(this.filter, type, freq, q, gainVal, now, time);
        } else if (this.mode === 'mid' && this.filterMid) {
            this._setFilterParams(this.filterMid, type, freq, q, midGainVal, now, time);
        } else if (this.mode === 'side' && this.filterSide) {
            this._setFilterParams(this.filterSide, type, freq, q, sideGainVal, now, time);
        } else if (this.mode === 'left' && this.filterL) {
            this._setFilterParams(this.filterL, type, freq, q, leftGainVal, now, time);
        } else if (this.mode === 'right' && this.filterR) {
            this._setFilterParams(this.filterR, type, freq, q, rightGainVal, now, time);
        }
    }

    _setFilterParams(filter, type, freq, q, gain, now, time) {
        try {
            if (filter.type !== type) filter.type = type;
            filter.frequency.setTargetAtTime(freq, now, time);
            filter.Q.setTargetAtTime(q, now, time);
            filter.gain.setTargetAtTime(gain, now, time);
        } catch(e) {}
    }

    insertDynamicToChannel(channel, controller) {
        this._dynamicsController = controller;
        this._hasDynamic = true;
        if (this._dynGainNodes && this._dynGainNodes.length) {
            controller.setGainNodes(this._dynGainNodes);
        }
    }

    getFilterForDynamic() {
        switch(this.mode) {
            case 'stereo': return this.filter;
            case 'mid': return this.filterMid;
            case 'side': return this.filterSide;
            case 'left': return this.filterL;
            case 'right': return this.filterR;
            default: return this.filter;
        }
    }

    getGainForDisplay() {
        const band = this.band;
        switch(this.mode) {
            case 'stereo': return band.gain || 0;
            case 'mid': return band.midGain || 0;
            case 'side': return band.sideGain || 0;
            case 'left': return band.leftGain || 0;
            case 'right': return band.rightGain || 0;
            default: return band.gain || 0;
        }
    }

    getModeLabel() {
        const labels = { 'stereo':'S', 'mid':'M', 'side':'S', 'left':'L', 'right':'R' };
        return labels[this.mode] || 'S';
    }

    isLinkMode() {
        return false;
    }

    setMode(mode) {
        if (this.mode !== mode) {
            this.mode = mode;
            this.buildChain();
            this.updateParams();
            return true;
        }
        return false;
    }

    destroy() {
        this._destroyNodes();
        this.inputNode = null;
        this.outputNode = null;
        this.filter = null;
        this.filterMid = null;
        this.filterSide = null;
        this.filterL = null;
        this.filterR = null;
        this._dynGainNodes = [];
        this._midMerger = null;
        this._sideMerger = null;
        this._midSum = null;
        this._sideSum = null;
        this._splitter = null;
        this._merger = null;

        if (this._dynamicsController) {
            try {
                this._dynamicsController.destroy();
            } catch(e) {}
            this._dynamicsController = null;
        }
        this._hasDynamic = false;
        this.ctx = null;
        this.band = null;
        this.state = null;
    }
}
