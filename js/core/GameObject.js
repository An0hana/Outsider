export class GameObject {
    constructor(name = 'GameObject') {
        this.name = name;
        this.components = [];
        this._componentMap = new Map();
        this.scene = null;
    }

    addComponent(component) {
        component.gameObject = this;
        this.components.push(component);
        this._componentMap.set(component.constructor, component);
        if (typeof component.init === 'function') {
            component.init();
        }
        return component;
    }

    getComponent(ComponentClass) {
        return this._componentMap.get(ComponentClass);
    }

    update(deltaTime, input) {
        for (const component of this.components) {
            if (typeof component.update === 'function') {
                component.update(deltaTime, input);
            }
        }
    }
}