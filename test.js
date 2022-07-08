function M() {
    function A() {
        console.log('A');

        function D() {
            console.log('D');

            C();
        }

        return D;

    }

    function B() {
        console.log('B');
    }

    function C() {
        console.log('C');
    }

    return A();
}

const D = M();
D();



function A() {
    const a = 11;

    return function B() {
        console.log(a);
    }
}

const B = A();
B();