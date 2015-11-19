
export default class RepeatGroup {

    constructor (key, repeat_dist) {
        this.key = key;
        this.repeat_dist = repeat_dist;
        this.repeat_dist_sq = this.repeat_dist * this.repeat_dist;
        this.objs = [];
        // TODO: if repeat dist past full tile threshold, mark as one-per-tile
        // and skip future distance checks
    }

    check (obj) {
        for (let i=0; i < this.objs.length; i++) {
            let obj2 = this.objs[i];
            let dx = obj.position[0] - obj2.position[0];
            let dy = obj.position[1] - obj2.position[1];
            let dist_sq = dx * dx + dy * dy;

            if (dist_sq < this.repeat_dist_sq) {
                return { dist_sq, repeat_dist_sq: this.repeat_dist_sq };
            }
        }
    }

    add (obj) {
        this.objs.push(obj);
    }

    static check (obj, layout) {
        if (layout.repeat_dist && this.groups[layout.repeat_key]) {
            return this.groups[layout.repeat_key].check(obj);
        }
    }

    static add (obj, layout) {
        if (layout.repeat_dist && this.groups[layout.repeat_key] == null) {
            this.groups[layout.repeat_key] = new RepeatGroup(layout.repeat_key, layout.repeat_dist);
        }
        this.groups[layout.repeat_key].add(obj);
    }

}

RepeatGroup.groups = {};
