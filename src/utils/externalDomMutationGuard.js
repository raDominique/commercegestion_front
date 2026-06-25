let installed = false;

export function installExternalDomMutationGuard() {
  if (installed || typeof Node === 'undefined') return;

  const nativeRemoveChild = Node.prototype.removeChild;
  const nativeInsertBefore = Node.prototype.insertBefore;
  const nativeReplaceChild = Node.prototype.replaceChild;

  const isDetachedNodeError = (error) => error?.name === 'NotFoundError';

  Node.prototype.removeChild = function guardedRemoveChild(child) {
    try {
      return nativeRemoveChild.call(this, child);
    } catch (error) {
      if (isDetachedNodeError(error) && child?.parentNode !== this) {
        return child;
      }
      throw error;
    }
  };

  Node.prototype.insertBefore = function guardedInsertBefore(newNode, referenceNode) {
    try {
      return nativeInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
      if (isDetachedNodeError(error) && referenceNode?.parentNode !== this) {
        return this.appendChild(newNode);
      }
      throw error;
    }
  };

  Node.prototype.replaceChild = function guardedReplaceChild(newChild, oldChild) {
    try {
      return nativeReplaceChild.call(this, newChild, oldChild);
    } catch (error) {
      if (isDetachedNodeError(error) && oldChild?.parentNode !== this) {
        if (newChild?.parentNode !== this) {
          this.appendChild(newChild);
        }
        return oldChild;
      }
      throw error;
    }
  };

  installed = true;
}
