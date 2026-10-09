# Credits — Electric Field Mapper

Electric Field Mapper is an OpenLyceum simulation built with [SceneryStack](https://scenerystack.org/) and scaffolded from [SceneryStackTemplate](https://github.com/OpenLyceum/SceneryStackTemplate).

## Physics and interaction references

[PhET's Charges and Fields](https://phet.colorado.edu/en/simulations/charges-and-fields) informed the Coulomb field and potential calculations, shaded charge spheres, electric field sensors, voltage colours, voltmeter, and measuring tape interactions. Its published source was consulted locally at `/home/veillette/totality/charges-and-fields`.

A local Charges and Fields extension at `/home/veillette/vgit/charges-and-fields/js/charges-and-fields/model/ElectricFieldLine.ts` informed the bidirectional Runge–Kutta field-line approach. This repository implements its own electrostatics model and SceneryStack canvas rendering.

## License

GNU Affero General Public License v3.0 or later — see the [OpenLyceum organization license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).
