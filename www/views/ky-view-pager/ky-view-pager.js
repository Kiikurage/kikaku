/**
 * @TODO チラつきの防止
 * 別のビューへの移動の際に、画面がちらつく
 * opacityを0にする前に一度2枚を重ねてしまっているのが原因か？
 *
 * (2014/12/6 追記)
 * translateX ではなく translate3d を使ったら何故かチラツキはなくなった。
 * 依然、カクツキは残っている.
 *
 * matrix3dでscaleも含めすべて指定したら相当早くなった。
 * カクツキも軽減は出来た
 */
(function () {

    var EventName = {
        TRANSITIONEND: 'transitionend'
    };

    var Style = {
        TRANSITION_TRUE: '210ms ease-in-out',
        TRANSITION_FALSE: 'none'
    };

    /**
     * ノードのアニメーションを制御する。
     * @param {HTMLElement} node ノード
     * @param {boolean} flag スタイルオブジェクト
     */
    function toggleTransition(node, flag) {
        if (flag) {
            node.style.transition = Style.TRANSITION_TRUE;
        } else {
            node.style.transition = Style.TRANSITION_FALSE;
        }
    }

    /**
     * transitionendイベントに対するコールバックを設定する。
     * このコールバックは一度呼ばれると解除される。
     * @param {HTMLElement} node 設定対象のノード
     * @param {function} fn コールバック関数
     */
    function setTransitionEndCallback(node, fn) {
        var proxy = function (ev) {
            if (ev.path[0] !== node) return;
            node.removeEventListener(EventName.TRANSITIONEND, proxy);
            fn.call(node, ev);
        };
        node.addEventListener(EventName.TRANSITIONEND, proxy);
    }

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.selectedIndex = -1;
        this.$ = {
            base: shadow.getElementById('base')
        };
    };

    prototype.attachedCallback = function () {
        application.initializedPromise.then(this.setup.bind(this));
    };

    prototype.__defineGetter__('childViews', function () {
        return Array.prototype.slice.call(this.children, 0);
    });

    prototype.setup = function () {
        this.childViews.map(this.setDefaultViewStyle.bind(this));
        this.jump(this.getAttribute('selectedIndex') || 0, false);
    };

    /**
     * Viewのスタイルを通常状態に設定する
     * Viewは通常では、横一列にbase内に並んでいる
     * （実際には、1箇所に重なっており、translate3dで横に並べる）
     * @param {kyView} childView
     */
    prototype.setDefaultViewStyle = function (childView) {
        if (!childView) return;

        var style = childView.style,
            index = this.childViews.indexOf(childView);

        style.opacity = 1;
        style.zIndex = 1;
        if (index === this.selectedIndex) {
            style.display = '';
        } else {
            style.display = 'none';
        }
        style.transition = 'none';
        style.transform = 'none';
    };

    /**
     * Viewを瞬時に移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.jump = function (index, flagNoEvent) {
        var nextView, currentView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index == this.selectedIndex) {
            return false
        }

        currentView = this.childViews[this.selectedIndex];
        nextView = this.childViews[index];

        if (!flagNoEvent) {
            if (currentView) {
                currentView.dispatchEvent(new CustomEvent('deactive', {
                    detail: {
                        from: currentView,
                        to: nextView
                    }
                }));
            }

            nextView.dispatchEvent(new CustomEvent('active', {
                detail: {
                    from: currentView,
                    to: nextView
                }
            }));
        }


        this.selectedIndex = index;

        this.setDefaultViewStyle(currentView);
        this.setDefaultViewStyle(nextView);
        return true
    };

    /**
     * Viewをフェードインする
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.fadeIn = function (index) {
        var views = this.children,
            clientWidth = this.clientWidth,
            selectedIndex = this.selectedIndex,
            currentView = views[selectedIndex],
            self = this,
            nextView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }
        if (index === selectedIndex) {
            self.setDefaultViewStyle(currentView);
            self.jump(index, true);
            return false
        }

        nextView = views[index];
        currentView.dispatchEvent(new CustomEvent('deactive', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));

        return new Promise(function (resolve, reject) {
            setTransitionEndCallback(nextView, function () {
                self.setDefaultViewStyle(nextView);
                self.jump(index, true);
                resolve();
            });

            toggleTransition(nextView, false);

            nextView.style.opacity = 0;
            nextView.style.zIndex = 2;
            nextView.style.display = '';

            requestAnimationFrame(function () {
                toggleTransition(nextView, true);

                nextView.style.opacity = 1;
            });
        })
    };

    /**
     * Viewをフェードアウトする
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.fadeOut = function (index) {
        var views = this.children,
            clientWidth = this.clientWidth,
            selectedIndex = this.selectedIndex,
            currentView = views[selectedIndex],
            self = this,
            nextView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }
        if (index === selectedIndex) {
            self.setDefaultViewStyle(currentView);
            self.jump(index, true);
            return false
        }

        nextView = views[index];
        currentView.dispatchEvent(new CustomEvent('deactive', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));

        return new Promise(function (resolve, reject) {
            setTransitionEndCallback(currentView, function () {
                self.setDefaultViewStyle(nextView);
                self.setDefaultViewStyle(currentView);
                self.jump(index, true);
                resolve();
            });

            toggleTransition(nextView, false);
            toggleTransition(currentView, false);

            currentView.style.opacity = 1;
            currentView.style.zIndex = 2;
            nextView.style.display = '';

            requestAnimationFrame(function () {
                toggleTransition(currentView, true);

                currentView.style.opacity = 0;
            });
        });
    };

    /**
     * Viewを重ねるように移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.cover = function (index) {
        var views = this.children,
            clientWidth = this.clientWidth,
            selectedIndex = this.selectedIndex,
            currentView = views[selectedIndex],
            self = this,
            nextView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }
        if (index === selectedIndex) {
            self.setDefaultViewStyle(currentView);
            self.jump(index, true);
            return false
        }
        nextView = views[index];

        currentView.dispatchEvent(new CustomEvent('deactive', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));

        return new Promise(function (resolve, reject) {
            setTransitionEndCallback(nextView, function () {
                self.setDefaultViewStyle(nextView);
                self.setDefaultViewStyle(currentView);
                self.jump(index, true);
                resolve();
            });

            toggleTransition(currentView, false);
            toggleTransition(nextView, false);

            requestAnimationFrame(function () {
                currentView.style.transform = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)';
                currentView.style.opacity = 1;
                nextView.style.transform = 'translate3d(' + clientWidth * 0.7 + 'px, 0, 0)';
                nextView.style.display = '';
                nextView.style.opacity = 0;

                requestAnimationFrame(function () {
                    toggleTransition(currentView, true);
                    toggleTransition(nextView, true);

                    requestAnimationFrame(function () {
                        currentView.style.transform = 'matrix3d(0.9,0,0,0, 0,0.9,0,0, 0,0,1,0, 0,0,0,1)';
                        currentView.style.opacity = 0.8;
                        nextView.style.transform = 'translate3d(0, 0, 0)';
                        nextView.style.opacity = 1;
                    });
                });
            });
        })
    };

    /**
     * ビューをめくるように移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.uncover = function (index) {
        var views = this.children,
            clientWidth = this.clientWidth,
            selectedIndex = this.selectedIndex,
            currentView = views[selectedIndex],
            self = this,
            nextView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }
        if (index === selectedIndex) {
            self.setDefaultViewStyle(currentView);
            self.jump(index, true);
            return false
        }
        nextView = views[index];

        currentView.dispatchEvent(new CustomEvent('deactive', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));

        return new Promise(function (resolve, reject) {
            setTransitionEndCallback(currentView, function () {
                self.setDefaultViewStyle(nextView);
                self.setDefaultViewStyle(currentView);
                self.jump(index, true);
                resolve();
            });

            toggleTransition(currentView, false);
            toggleTransition(nextView, false);

            requestAnimationFrame(function () {
                currentView.style.transform = 'translate3d(0, 0, 0)';
                currentView.style.opacity = 1;
                nextView.style.display = '';
                nextView.style.transform = 'matrix3d(0.9,0,0,0, 0,0.9,0,0, 0,0,1,0, 0,0,0,1)';
                nextView.style.opacity = 0.8;

                requestAnimationFrame(function () {
                    toggleTransition(currentView, true);
                    toggleTransition(nextView, true);

                    requestAnimationFrame(function () {
                        currentView.style.transform = 'translate3d(' + clientWidth + 'px, 0, 0)';
                        currentView.style.opacity = 0;
                        nextView.style.transform = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)';
                        nextView.style.opacity = 1;
                    });
                });
            });

        });
    };

    /**
     * Viewを重ねるように移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.coverUp = function (index) {
        var views = this.children,
            clientHeight = this.clientHeight,
            selectedIndex = this.selectedIndex,
            currentView = views[selectedIndex],
            self = this,
            nextView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }
        if (index === selectedIndex) {
            self.setDefaultViewStyle(currentView);
            self.jump(index, true);
            return false
        }
        nextView = views[index];

        currentView.dispatchEvent(new CustomEvent('deactive', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));

        return new Promise(function (resolve, reject) {
            setTransitionEndCallback(nextView, function () {
                self.setDefaultViewStyle(nextView);
                self.setDefaultViewStyle(currentView);
                self.jump(index, true);
                resolve();
            });

            toggleTransition(currentView, false);
            toggleTransition(nextView, false);

            requestAnimationFrame(function () {
                currentView.style.transform = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)';
                currentView.style.opacity = 1;
                nextView.style.transform = 'translate3d(0, ' + clientHeight + 'px, 0)';
                nextView.style.display = '';
                nextView.style.opacity = 1;

                requestAnimationFrame(function () {
                    toggleTransition(currentView, true);
                    toggleTransition(nextView, true);

                    requestAnimationFrame(function () {
                        currentView.style.transform = 'matrix3d(0.9,0,0,0, 0,0.9,0,0, 0,0,1,0, 0,0,0,1)';
                        currentView.style.opacity = 0.8;
                        nextView.style.transform = 'translate3d(0, 0, 0)';
                    });
                });
            });
        })
    };

    /**
     * ビューをめくるように移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.uncoverDown = function (index) {
        var views = this.children,
            clientHeight = this.clientHeight,
            selectedIndex = this.selectedIndex,
            currentView = views[selectedIndex],
            self = this,
            nextView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }
        if (index === selectedIndex) {
            self.setDefaultViewStyle(currentView);
            self.jump(index, true);
            return false
        }
        nextView = views[index];

        currentView.dispatchEvent(new CustomEvent('deactive', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: currentView,
                to: nextView
            }
        }));

        return new Promise(function (resolve, reject) {
            setTransitionEndCallback(currentView, function () {
                self.setDefaultViewStyle(nextView);
                self.setDefaultViewStyle(currentView);
                self.jump(index, true);
                resolve();
            });

            toggleTransition(currentView, false);
            toggleTransition(nextView, false);

            requestAnimationFrame(function () {
                currentView.style.transform = 'translate3d(0, 0, 0)';
                nextView.style.display = '';
                nextView.style.transform = 'matrix3d(0.9,0,0,0, 0,0.9,0,0, 0,0,1,0, 0,0,0,1)';
                nextView.style.opacity = 0.8;

                requestAnimationFrame(function () {
                    toggleTransition(currentView, true);
                    toggleTransition(nextView, true);

                    requestAnimationFrame(function () {
                        currentView.style.transform = 'translate3d(0, ' + clientHeight + 'px, 0)';
                        nextView.style.transform = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)';
                        nextView.style.opacity = 1;
                    });
                });
            });

        });
    };

    /**
     * 横スライドでViewを移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.slideLeft = function (index) {
        var clientWidth = this.clientWidth,
            self = this,
            nextView, currentView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }

        if (index === this.selectedIndex) {
            return false
        }

        currentView = this.childViews[this.selectedIndex];
        nextView = this.childViews[index];

        if (currentView) {
            currentView.dispatchEvent(new CustomEvent('deactive', {
                detail: {
                    from: this.childViews[this.selectedIndex],
                    to: this.childViews[index]
                }
            }));
        }
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: this.childViews[this.selectedIndex],
                to: this.childViews[index]
            }
        }));

        toggleTransition(currentView, false);
        toggleTransition(nextView, false);
        toggleTransition(this.$.base, true);

        requestAnimationFrame(function () {
            currentView.style.transform = 'translate3d(0, 0, 0)';
            nextView.style.transform = 'translate3d(' + clientWidth + 'px, 0, 0)';
            nextView.style.display = '';
            self.$.base.style.transform = 'translate3d(-' + clientWidth + 'px, 0, 0)';

            setTransitionEndCallback(self.$.base, function () {
                toggleTransition(self.$.base, false);

                requestAnimationFrame(function () {
                    self.jump(index, true);
                    self.$.base.style.transform = 'translate3d(0, 0, 0)';
                });
            });
        });

        return true
    };

    /**
     * 横スライドでViewを移動する
     * @param {number} index 移動先Viewのインデックス
     */
    prototype.slideRight = function (index) {
        var clientWidth = this.clientWidth,
            self = this,
            nextView, currentView;

        if (index instanceof Node) {
            index = this.childViews.indexOf(index);
        } else if (typeof index === 'string') {
            index = this.childViews.indexOf(this.querySelector('#' + index));
        }

        if (index < 0) {
            return false
        }

        if (index === this.selectedIndex) {
            return false
        }

        currentView = this.childViews[this.selectedIndex];
        nextView = this.childViews[index];

        if (currentView) {
            currentView.dispatchEvent(new CustomEvent('deactive', {
                detail: {
                    from: this.childViews[this.selectedIndex],
                    to: this.childViews[index]
                }
            }));
        }
        nextView.dispatchEvent(new CustomEvent('active', {
            detail: {
                from: this.childViews[this.selectedIndex],
                to: this.childViews[index]
            }
        }));

        toggleTransition(currentView, false);
        toggleTransition(nextView, false);
        toggleTransition(this.$.base, true);

        requestAnimationFrame(function () {
            currentView.style.transform = 'translate3d(0, 0, 0)';
            nextView.style.transform = 'translate3d(-' + clientWidth + 'px, 0, 0)';
            nextView.style.display = '';
            self.$.base.style.transform = 'translate3d(+' + clientWidth + 'px, 0, 0)';

            setTransitionEndCallback(self.$.base, function () {
                toggleTransition(self.$.base, false);

                requestAnimationFrame(function () {
                    self.jump(index, true);
                    self.$.base.style.transform = 'translate3d(0, 0, 0)';
                });
            });
        });

        return true
    };

    //ショートカット
    prototype.slide = prototype.slideLeft;

    document.registerElement('ky-view-pager', {
        prototype: prototype
    });
}());