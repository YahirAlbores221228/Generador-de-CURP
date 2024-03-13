import { useRef, useState } from 'react';
import curp from 'curp';
import ReCAPTCHA from 'react-google-recaptcha';
import QRCode from 'react-qr-code';
import moment from 'moment';
import Swal from 'sweetalert2';
import '../assets/Styles/Styles.css';

function Form() {
    const formDataU = useRef(null);
    const [resultado, setResultado] = useState("");
    const [qr, setQr] = useState(false);
    const [atributes, setAtributes] = useState("")

    const recaptcha = useRef();

    function handleSubmit(event) {
        event.preventDefault();

        if (recaptcha.current.getValue()) {
            recaptcha.current.hidden = true
            recaptcha.current.reset()

            const formData = new FormData(formDataU.current);
            const persona = curp.getPersona();
            persona.nombre = formData.get('nombre');
            persona.apellidoPaterno = formData.get('apellidoPaterno')
            persona.apellidoMaterno = formData.get('apellidoMaterno');
            persona.fechaNacimiento = moment(formData.get('fechaNacimiento')).format('DD-MM-YYYY');
            persona.genero = formData.get('sexo');
            persona.estado = formData.get('estado');

            const attributesString = `Nombre: ${persona.nombre}, \nApellidoPaterno: ${persona.apellidoPaterno}, \nApellidoMaterno: ${persona.apellidoMaterno}, \nFechaNacimiento: ${persona.fechaNacimiento}, \nSexo: ${persona.genero}, \nEstado: ${persona.estado}`

            if (persona.nombre === '' || persona.apellidoPaterno === '' || persona.apellidoMaterno === '' || persona.fechaNacimiento === '' || persona.sexo === '' || persona.estado === '') {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Todos los campos son obligatorios",
                });
            }

            const curpGenerada = curp.generar(persona);

            if (persona.estado === 'CS') {
                Swal.fire({
                    icon: "success",
                    title: "Exitoso",
                    text: "CURP generada correctamente",
                });
                const curpGeneradaString = curpGenerada.toString();
                const atributes = attributesString.toString();
                setResultado("La CURP generada es: " + curpGeneradaString + "\n");
                setAtributes("\nDatos de la persona:\n" + atributes)
                setQr(true)
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Por lo pronto solo generamos CURP del estado de chiapas",
                });
            }

        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Resuelva el RECAPTCHA",
            });
        }
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
                        <input type="date" id="fechaNacimiento" required name='fechaNacimiento' />
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
                        <ReCAPTCHA className='captcha' ref={recaptcha} sitekey={'6Le5VZIpAAAAANhhPcuwfcyQV6x428ydeRK6WTGH'} />
                    </div>
                </div>
            </form>
            <div className='resultado'>
                <h1 className='title-resultado'>Resultados</h1>
                <div>
                    {resultado}
                </div>
                <div>
                    {qr && (
                        <QRCode value={(resultado + atributes)} display={'block'} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Form;