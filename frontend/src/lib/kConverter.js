export const kConverter = (num) => {
    if(num >= 1000){
        return (num / 1000).toFixed(2) + 'K';
    } else{
        return num;
    }
}