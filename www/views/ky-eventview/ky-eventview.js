(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            viewSwitchTab: shadow.getElementById('viewSwitchTab'),
            title: shadow.getElementById('title'),
            backBtn: shadow.getElementById('backBtn'),
            mainPager: shadow.getElementById('mainPager'),
            homeView: shadow.getElementById('homeView'),
            dateView: shadow.getElementById('dateView'),
            memberView: shadow.getElementById('memberView'),
            chatView: shadow.getElementById('chatView'),
            shareView: shadow.getElementById('shareView')
        };

        this.selectedIndex = -1;
        this.model_ = null;

        this.onHardBackBtnPush = this.onHardBackBtnPush.bind(this);
        this.update = this.update.bind(this);

        this.addEventListener('active', this.onActive);
        this.addEventListener('deactive', this.onDeactive);
        this.$.homeView.addEventListener('eventCanceled', this.onEventCanceled.bind(this));
        this.$.viewSwitchTab.addEventListener('click', this.onViewSwitchTabClick.bind(this));
        this.$.backBtn.addEventListener('click', this.onBackBtnClick.bind(this));
    };

    prototype.__defineSetter__('model', function (newVal) {
        if (this.model) {
            this.model.removeEventListener('update', this.update);
        }

        this.model_ = newVal;
        this.$.homeView.model = newVal;
        this.$.dateView.model = newVal;
        this.$.memberView.model = newVal;
        this.$.chatView.model = newVal;
        this.$.shareView.model = newVal;

        if (newVal) {
            this.update();
            newVal.addEventListener('update', this.update);
        }
    });

    prototype.__defineGetter__('model', function () {
        return this.model_;
    });

    prototype.selectTab = function (index, flagJump) {
        if (this.selectedIndex === index) return;

        var tabs = this.$.viewSwitchTab.children;

        if (this.selectedIndex >= 0) {
            tabs[this.selectedIndex].classList.remove('-selected');
        }
        tabs[index].classList.add('-selected');

        flagJump ? this.$.mainPager.jump(index) : this.$.mainPager.slide(index);
        this.selectedIndex = index;
    };

    prototype.clear = function () {
        this.update();
        this.selectTab(0, true);
    };

    prototype.update = function () {
        var model = this.model;
        if (!model) return;

        this.$.title.innerText = model.name;
    };

    prototype.onActive = function (ev) {
        if (ev.detail.to !== this) return;

        this.model = application.models.selectedEvent;
        this.clear();
        document.addEventListener('backbutton', this.onHardBackBtnPush, false);
    };

    prototype.onDeactive = function (ev) {
        if (ev.detail.from !== this) return;

        document.removeEventListener('backbutton', this.onHardBackBtnPush, false);
    };

    prototype.onEventCanceled = function (ev) {
        this.requestNavigateViewBackward();
    };

    prototype.requestNavigateViewBackward = function () {
        this.dispatchEvent(new CustomEvent('navigateViewBackward'));
    };

    prototype.onViewSwitchTabClick = function (ev) {
        var target = ev.target,
            items = Array.prototype.slice.call(this.$.viewSwitchTab.children, 0),
            index = items.indexOf(target);

        while (index < 0) {
            target = target.parentNode;
            if (!target) return;
            index = items.indexOf(target);
        }

        this.selectTab(index);
    };

    prototype.onHardBackBtnPush = function (ev) {
        if (this.selectedIndex === 0) {
            application.gobackToTopView();
        } else {
            this.selectTab(0);
        }
    };

    prototype.onBackBtnClick = function (ev) {
        application.gobackToTopView();
    };

    document.registerElement('ky-eventview', {
        prototype: prototype
    });
}());
