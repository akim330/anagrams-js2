ArrTools = {
    Counter: function(array){
        array.forEach(val => this[val] = (this[val] || 0) + 1)

        this.superset = function(counter2, strict){
            extra_left = false;
            for (const [key, count] of Object.entries(counter2)){
                if (this[key] == undefined || this[key] - counter2[key] < 0){
                    return false
                }
                else if (this[key] - counter2[key] > 0){
                    extra_left = true;
                }
            }

            if (strict && !extra_left && Object.keys(counter1).length == Object.keys(counter2).length){
                return false
            }
            else{
                return true
            }
            
        }
    },

    shuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
    
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }
    
        return array;
    }
};

module.exports = ArrTools;