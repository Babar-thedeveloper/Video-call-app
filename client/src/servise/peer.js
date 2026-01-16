class PeerServise {
    constructor() {
        this.createPeer();
    }

    createPeer() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        });
        return this.peer;
    }

    reset() {
        if (this.peer) {
            try {
                this.peer.close();
            } catch (e) {
            }
        }
        this.createPeer();
    }

    addTracks(stream) {
        if (!stream) return;
        const existingTrackIds = new Set(
            this.peer.getSenders().map((s) => s.track && s.track.id).filter(Boolean)
        );
        for (const track of stream.getTracks()) {
            if (!existingTrackIds.has(track.id)) {
                this.peer.addTrack(track, stream);
            }
        }
    }

    async getOffer(stream) {
        this.addTracks(stream);
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    async getAnswer(offer, stream) {
        this.addTracks(stream);
        await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(ans);
        return ans;
    }

    async setRemoteAnswer(ans) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }

    async addIceCandidate(candidate) {
        if (!candidate) return;
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
}

export default new PeerServise();