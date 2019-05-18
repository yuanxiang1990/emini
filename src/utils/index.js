
export function isEmptyObject(obj) {
    for (let o in obj){
        return false;
    }
    return true;
}