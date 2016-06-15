import Label from './label'

export default class LabelGroup {

    constructor (labels) {
        this.labels = labels || [];
    }

    occluded (bboxes) {
        for (var i = this.labels.length - 1; i >= 0; i++){
            var label = this.labels[i];
            var isOccluded = Label.prototype.occluded.apply(label, arguments);
            if (isOccluded) this.remove(i);
        }

        return (this.labels.length > 0);
    }

    add (boxes) {
        for (var i = 0; i < this.labels.length; i++){
            var label = this.labels[i];
            Label.prototype.add.apply(label, arguments);
        }
    }

    inTileBounds () {
        for (var i = 0; i < this.labels.length; i++){
            var label = this.labels[i];
            var isInTile = Label.prototype.inTileBounds.apply(label, arguments);
            if (!isInTile) return false;
        }
        return true;
    }

    discard (bboxes) {
        for (var i = 0; i < this.labels.length; i++){
            var label = this.labels[i];
            var isDiscarded = Label.prototype.discard.apply(label, arguments);
            if (isDiscarded) {
                this.remove(i);
                return true;
            }
        }
        return (this.labels.length === 0);
    }

    remove (index) {
        this.labels.splice(index, 1);
    }
}