(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    /**
     * cloneNodeとdocumentFragmentを用いて効率的にノードの複製を作成する
     *
     * ex)ノードの複製を13個作りたい
     * 13 = 0x1101
     * -> ((((+1)*2+1)*2+0)*2+1
     */
    function optimizeCloneNode(srcNode, count) {
        var fragment = document.createDocumentFragment(),
            i, max;

        max = 0;
        while ((1 << max) <= count) {
            max++;
        }

        for (i = 0; i < max; i++) {
            fragment.appendChild(fragment.cloneNode(true));

            if (count & (1 << (max - (i + 1)))) {
                fragment.appendChild(srcNode.cloneNode(true));
            }
        }

        return fragment
    }

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.onModelUpdate = this.onModelUpdate.bind(this);

        this.$ = {
            itemContainer: shadow.getElementById('itemContainer')
        };
        this.model_ = null;

        this.addEventListener('touchend', this.onTouchEnd);

        this.update();
    };

    prototype.__defineGetter__('model', function () {
        return this.model_;
    });

    prototype.__defineSetter__('model', function (newVal) {
        if (this.model_) {
            this.model_.removeEventListener('update', this.onModelUpdate);
        }

        this.model_ = newVal;
        if (newVal) {
            newVal.addEventListener('update', this.onModelUpdate);
            this.update();
        }
    });

    prototype.update = function () {
        var model = this.model,
            container = this.$.itemContainer,
            modelLength, childTemplate, child;

        if (!model) return;
        modelLength = model.length;

        while (container.children.length > modelLength) {
            container.removeChild(container.lastChild);
        }

        if (container.children.length < modelLength) {
            childTemplate = this.querySelector('template');
            child = document.importNode(childTemplate.content, true).children[0];
            container.appendChild(optimizeCloneNode(child, modelLength - container.children.length));
        }

        Array.prototype.forEach.call(container.children, function (child, index) {
            child.model = model[index];
        });
    };

    prototype.onTouchEnd = function (ev) {
        var container = this.$.itemContainer,
            target = ev.path[0],
            index;

        /**
         * @TODO: MouseEvent.pathの修正
         * MouseEvent#pathは標準ではないかも？
         * 明確な資料がmdnでも見つからなかった。
         *
         * shadow dom をたどる必要があるためこの方法が必要
         */

        while (target.parentNode !== container) {
            target = target.parentNode || target.host;
            if (!target) return;
        }

        index = Array.prototype.indexOf.call(container.children, target);
        if (index === -1) return;

        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                index: index,
                node: target,
                model: this.model[index]
            }
        }));
    };

    prototype.onModelUpdate = function () {
        this.update();
    };

    document.registerElement('ky-list', {
        prototype: prototype
    });
}()
)
;
