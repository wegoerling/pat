exports.create = actor;


function actor(role, name) {
    var vm = this;

    vm.role = role;
    vm.name = name;
}