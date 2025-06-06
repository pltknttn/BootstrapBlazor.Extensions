﻿import { Sortable, MultiDrag, Swap } from '../sortable.esm.js'
import Data from '../../BootstrapBlazor/modules/data.js'

export function init(id, invoke, options, triggerUpdate, triggerRemove, triggerAdd) {
    const el = document.getElementById(id);
    if (el === null) {
        return;
    }

    const op = getOptions(options);
    op.triggerUpdate = triggerUpdate;
    op.triggerRemove = triggerRemove;
    op.triggerAdd = triggerAdd;

    if (op.multiDrag) {
        Sortable.mount(new MultiDrag());
    }

    if (op.swap) {
        Sortable.mount(new Swap());
    }

    let element = el;
    if (op.rootSelector) {
        loopCheck(id, element, invoke, op);
    }
    else {
        initSortable(id, element, invoke, op);
    }
}

const loopCheck = (id, el, invoke, op) => {
    const check = () => {
        const element = el.querySelector(op.rootSelector);
        if (element === null) {
            op.loopCheckHeightHandler = requestAnimationFrame(check);
        }
        else {
            delete op.loopCheckHeightHandler;
            initSortable(id, element, invoke, op);
        }
    };
    check();
}

const initSortable = (id, element, invoke, op) => {
    delete op.rootSelector;

    op.group = {
        name: op.group
    };

    if (op.clone === true) {
        op.group = {
            ...op.group,
            pull: 'clone'
        };
        delete op.clone;
    }

    if (op.putback === false) {
        op.group = {
            ...op.group,
            pull: 'clone',
            put: false
        };
        delete op.putback;
    }

    if (op.triggerUpdate) {
        op.onUpdate = event => {
            const items = [];
            if (op.multiDrag) {
                event.oldIndicies.forEach((v, index) => {
                    items.push({ oldIndex: v.index, newIndex: event.newIndicies[index].index });
                });
            }
            else {
                items.push({ oldIndex: event.oldIndex, newIndex: event.newIndex });
            }
            invoke.invokeMethodAsync('TriggerUpdate', items);
        }
    }

    if (op.triggerRemove) {
        op.onRemove = event => {
            if (event.pullMode === 'clone') {
                event.clone.remove();
                event.item.remove();
                event.from.insertBefore(event.item, event.from.childNodes[event.oldIndex]);
            }

            const items = [];
            if (op.multiDrag) {
                event.oldIndicies.forEach((v, index) => {
                    items.push({ OldIndex: v.index, NewIndex: event.newIndicies[index].index });
                });
            }
            else {
                items.push({ oldIndex: event.oldIndex, newIndex: event.newIndex });
            }
            invoke.invokeMethodAsync('TriggerRemove', items);
        }
    }

    if (op.triggerAdd) {
        op.onAdd = event => {
            var closestParent = event.from.closest('.bb-sortable');
            if (closestParent) {
                const items = [];
                if (op.multiDrag) {
                    event.oldIndicies.forEach((v, index) => {
                        items.push({ OldIndex: v.index, NewIndex: event.newIndicies[index].index, FromId: closestParent.id });
                    });
                }
                else {
                    items.push({ oldIndex: event.oldIndex, newIndex: event.newIndex, FromId: closestParent.id });
                }
                invoke.invokeMethodAsync('TriggerAdd', items);
            }
        }
    }

    const sortable = Sortable.create(element, op);
    Data.set(id, { element, sortable });
}

const getOptions = options => {
    return {
        rootSelector: null,
        animation: 150,
        ...options
    }
}

export function dispose(id) {
    const sortable = Data.get(id);
    Data.remove(id);
}
