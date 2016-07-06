import Utils from './utils';
import JSZip from 'jszip';

export class ResourceBundle {

    constructor(url, path) {
        this.url = url;
        this.path = path || Utils.pathForURL(this.url);
    }

    load() {
        return Utils.loadResource(this.url);
    }

    urlFor(url) {
        return Utils.addBaseURL(url, this.path);
    }

}

export class ZipBundle extends ResourceBundle {

    constructor(url, path) {
        super(url, path);
        this.zip = null;
        this.files = {};
        this.urls = {};

        // Make root file name by substituting or .yaml extension to .zip file name
        this.root = url.split('/').pop().split('.zip').shift() + '.yaml';
    }

    load() {
        this.zip = new JSZip();

        if (typeof this.url === 'string') {
            return Utils.io(this.url, 60000, 'arraybuffer')
                .then(body => this.zip.loadAsync(body))
                .then(() => this.parseZipFiles())
                .then(() => {
                    let url = this.urlForZipFile(this.root);
                    return Utils.loadResource(url);
                })
                .catch(e => { throw e; });
        } else {
            return Promise.resolve(this);
        }
    }

    urlFor(url) {
        if (Utils.isRelativeURL(url)) {
            return this.urlForZipFile(url);
        }
        return Utils.addBaseURL(url, this.path);
    }

    parseZipFiles() {
        let paths = [];
        let queue = [];
        this.zip.forEach((path, file) => {
            if (!file.dir) {
                paths.push(path);
                queue.push(file.async('arraybuffer'));
            }
        });

        return Promise.all(queue).then(data => {
            for (let i=0; i < data.length; i++) {
                this.files[paths[i]] = { data: data[i] };
            }
        });
    }

    urlForZipFile(file) {
        if (this.files[file]) {
            if (!this.files[file].url) {
                this.files[file].url = Utils.createObjectURL(new Blob([this.files[file].data]));
            }

            return this.files[file].url;
        }
    }

}

export function createResourceBundle(url, path) {
    if (typeof url === 'string' && Utils.extensionForURL(url) === 'zip') {
        return new ZipBundle(url, path);
    }
    return new ResourceBundle(url, path);
}
