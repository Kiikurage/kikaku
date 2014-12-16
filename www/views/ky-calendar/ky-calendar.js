//TODO:
// 選択済みかどうかのマッチは、
// 各日付に対して全選択リストをマッチングするより、
// 全選択リストを各日付にマッチングしたほうが効率がいい

(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            base: shadow.getElementById('base'),
            header: shadow.getElementById('header'),
            title: shadow.getElementById('title'),
            prev: shadow.getElementById('prev'),
            next: shadow.getElementById('next')
        };

        this.selected = [];

        this.$.base.addEventListener('click', this.onclick_.bind(this));
        this.$.prev.addEventListener('click', this.onprevclick_.bind(this));
        this.$.next.addEventListener('click', this.onnextclick_.bind(this));
        this.update_();
    };

    prototype.__defineGetter__('year', function () {
        return parseInt(this.getAttribute('year')) || new Date().getFullYear();
    });

    prototype.__defineSetter__('year', function (newVal) {
        if (newVal < 1900) newVal = 1900;
        if (newVal > 2500) newVal = 2500;
        this.setAttribute('year', newVal);
        this.update_();
    });

    prototype.__defineGetter__('month', function () {
        return parseInt(this.getAttribute('month')) || new Date().getMonth() + 1;
    });

    prototype.__defineSetter__('month', function (newVal) {
        if (newVal < 1) newVal = 1;
        if (newVal > 12) newVal = 12;
        this.setAttribute('month', newVal);
        this.update_();
    });

    prototype.__defineGetter__('multi', function () {
        return this.hasAttribute('multi');
    });

    prototype.__defineSetter__('multi', function (newVal) {
        if (newVal) {
            this.setAttribute('multi', 'true');
        } else {
            this.removeAttribute('multi');
        }
    });

    prototype.clear = function () {
        this.selected = [];
        this.update_();
    };

    prototype.update_ = function () {
        var year = this.year,
            month = this.month,
            date = 1,
            day = new Date(year, month - 1, date).getDay(),
            dateCount = new Date(year, month, 0).getDate(),
            html = '',
            flagEnd = false,
            classNames, dateStr, i;

        date -= day;

        while (1) {
            html += '<div class="week">';
            for (i = 0; i < 7; i++) {
                if (date > dateCount) {
                    flagEnd = true;
                    html += '<div class="date date-outrange">-</div>';
                } else if (date < 1) {
                    html += '<div class="date date-outrange">-</div>';
                } else {
                    classNames = ['date'];

                    if (i === 0) {
                        classNames.push('date-sunday');
                    }
                    if (i === 6) {
                        classNames.push('date-saturday');
                    }
                    if (this.isSelected(year, month, date)) {
                        classNames.push('date-selected');
                    }

                    html +=
                        '<div class="' + classNames.join(' ') + '" data-date="' + date.toString(10) + '">' +
                        date.toString(10) + '</div>';
                }
                date++;
            }
            html += '</div>';
            if (flagEnd || date > dateCount) break;
        }
        this.$.base.innerHTML = html;
        this.$.title.innerText = '' + year + '年' + month + '月';
    };

    prototype.isSelected = function (year, month, date) {
        var selected = this.selected,
            i, max;

        for (i = 0, max = selected.length; i < max; i++) {
            if (selected[i].year == year &&
                selected[i].month == month &&
                selected[i].date == date) {
                return true;
            }
        }
        return false;
    };

    prototype.toggleSelect = function (year, month, date) {
        var selected = this.selected,
            i, max;

        for (i = 0, max = selected.length; i < max; i++) {
            if (selected[i].year == year &&
                selected[i].month == month &&
                selected[i].date == date) {
                selected.splice(i, 1);
                this.dispatchEvent(new CustomEvent('change'));
                this.update_();
                return;
            }
        }

        if (this.multi) {
            selected.push({
                year: year,
                month: month,
                date: date
            });
        } else {
            this.selected = [{
                year: year,
                month: month,
                date: date
            }];
        }

        this.dispatchEvent(new CustomEvent('change'));
        this.update_();
    };

    prototype.onprevclick_ = function (ev) {
        if (this.month === 1) {
            this.year--;
            this.month = 12;
        } else {
            this.month--;
        }
    };

    prototype.onnextclick_ = function (ev) {
        if (this.month === 12) {
            this.year++;
            this.month = 1;
        } else {
            this.month++;
        }
    };

    prototype.onclick_ = function (ev) {
        var target = ev.target;

        if (!target) return;
        while (!target.classList.contains('date')) {
            target = target.parentNode;
            if (!target || !target.classList) return;
        }

        ev.stopPropagation();

        if (target.classList.contains('date-outrange')) return;

        this.toggleSelect(this.year, this.month, parseInt(target.dataset.date));
    };

    document.registerElement('ky-calendar', {
        prototype: prototype
    });
}());
