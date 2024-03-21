import { useRef, useState } from 'react';
import curp from 'curp';
import ReCAPTCHA from 'react-google-recaptcha';
import QRCode from 'react-qr-code';
import moment from 'moment';
import Swal from 'sweetalert2';
import '../assets/Styles/Styles.css';
const apikey = import.meta.env.VITE_API_KEY

function Form() {
    const formDataU = useRef(null);
    const recaptcha = useRef();
    const [result, setResult] = useState("");
    const [attributes, setAttributes] = useState("")
    const [qr, setQr] = useState(false);

    const validateDate = (e) => {
        const date = new Date(e.target.value);
        const today = new Date();
        if (date >= today) {
            viewError("Fecha invalida")
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (recaptcha.current.getValue()) {
            handleValidRecaptcha();
        } else {
            handleInvalidRecaptcha();
        }
    }

    function handleValidRecaptcha() {
        recaptcha.current.hidden = true;
        recaptcha.current.reset();

        const formData = new FormData(formDataU.current);
        const person = getDatosPersona(formData);

        if (dataPersonValid(person)) {
            generateCurp(person);
        }
    }

    function getDatosPersona(formData) {
        const person = curp.getPersona();
        person.nombre = formData.get('nombre');
        person.apellidoPaterno = formData.get('apellidoPaterno');
        person.apellidoMaterno = formData.get('apellidoMaterno');
        person.fechaNacimiento = moment(formData.get('fechaNacimiento')).format('DD-MM-YYYY');
        person.genero = formData.get('sexo');
        person.estado = formData.get('estado');
        return person;
    }

    function dataPersonValid(person) {
        const expressions = /^[a-zA-Z\s]+$/;
        const year = moment(person.fechaNacimiento, 'DD-MM-YYYY').year();

        if (person.nombre === '' || person.apellidoPaterno === '' || person.apellidoMaterno === '' || person.fechaNacimiento === '' || person.sexo === '' || person.estado === '') {
            viewError("Todos los campos son obligatorios");
            return false;
        } else if (!expressions.test(person.nombre) || !expressions.test(person.apellidoPaterno) || !expressions.test(person.apellidoMaterno)) {
            viewError("Verifique de nuevo, hay caracteres no validos");
            setQr(false);
            setResult("");
            return false;
        } else if (year < 1900) {
            viewError("El año de nacimiento no puede ser menor que 1900");
            return false;
        }
        return true;
    }

    function generateCurp(person) {
        if (person.estado === 'CS') {
            const curpGenerada = curp.generar(person);
            viewExit("CURP generada correctamente");
            const curpGeneratestring = curpGenerada.toString();
            const attributes = datosToString(person);
            setResult("La CURP generada es: " + curpGeneratestring + "\n");
            setAttributes("\nDatos de la persona:\n" + attributes);
            setQr(true);
            formDataU.current.reset();
        } else {
            viewError("Por lo pronto solo generamos CURP del estado de Chiapas");
        }
    }

    function handleInvalidRecaptcha() {
        viewError("Resuelva el RECAPTCHA");
    }

    function viewError(mensaje) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: mensaje,
        });
    }

    function viewExit(mensaje) {
        Swal.fire({
            icon: "success",
            title: "Exitoso",
            text: mensaje,
        });
    }

    function datosToString(person) {
        return `Nombre: ${person.nombre}, \nApellidoPaterno: ${person.apellidoPaterno}, \nApellidoMaterno: ${person.apellidoMaterno}, \nFechaNacimiento: ${person.fechaNacimiento}, \nSexo: ${person.genero}, \nEstado: ${person.estado}`;
    }


    return (
        <div className="container">
            <form id="curpForm" ref={formDataU}>
                <div className='container-form'>
                    <div className='title-form'>
                        <h1 className='title'>GENERA TU CURP AQUI</h1>
                    </div>
                    <div className='Container_input'>
                        <label htmlFor="nombre">Nombre(s):</label>
                        <input type="text" id="nombre" required name='nombre' placeholder='Ingrese su nombre' />
                        <label htmlFor="apellidoMaterno">Apellido Materno:</label>
                        <input type="text" id="apellidoMaterno" required name='apellidoMaterno' placeholder='Ingrese su apellido materno' />
                        <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
                        <input type="date" id="fechaNacimiento" onChange={validateDate} required name='fechaNacimiento' />
                    </div>
                    <div className='Container_input'>
                        <label htmlFor="apellidoPaterno"> Apellido Paterno:</label>
                        <input type="text" id="apellidoPaterno" required name='apellidoPaterno' placeholder='Ingrese su apellido paterno' />
                        <label htmlFor="sexo">Sexo:</label>
                        <select id="sexo" required name='sexo' >
                            <option value="">Selecciona el sexo</option>
                            <option value="H">Hombre</option>
                            <option value="M">Mujer</option>
                        </select>
                        <label htmlFor="estado">Estado de Nacimiento:</label>
                        <select id="estado" required name='estado'  >
                            <option value="">Selecciona un estado</option>
                            <option value="CS">Chiapas</option>
                            <option value="CP">Campeche</option>
                            <option value="OX">Oaxaca</option>
                        </select>
                    </div>
                    <div className='container-button-verfi'>
                        <button type="submit" className='button' onClick={handleSubmit}>Generar</button>
                        <ReCAPTCHA className='captcha' ref={recaptcha} sitekey={apikey} />
                    </div>
                </div>
            </form>
            <div className='resultado'>
                <h1 className='title-resultado'>Resultados</h1>
                <div>
                    {result}
                </div>
                <div>
                    {qr && (
                        <QRCode value={(result + attributes)} display={'block'} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Form;