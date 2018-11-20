exports.create = actor;


function actor(role, name, evatasks) {
    var vm = this;

    vm.role = role;
    vm.name = name;
}