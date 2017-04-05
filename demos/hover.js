// Feature selection
var selection_info = document.createElement('div'); // shown on hover
selection_info.setAttribute('class', 'label');

function onFeatureHover (selection) {
    // Show selection info
    var feature = selection.feature;
    if (feature && feature.properties.name) {
        var name = feature.properties.name;

        selection_info.style.left = selection.pixel.x + 'px';
        selection_info.style.top = selection.pixel.y + 'px';
        selection_info.innerHTML = '<span class="labelInner">' + name + '</span>';

        if (selection_info.parentNode == null) {
            map.getContainer().appendChild(selection_info);
        }
    }
    else if (selection_info.parentNode != null) {
        selection_info.parentNode.removeChild(selection_info);
    }
}