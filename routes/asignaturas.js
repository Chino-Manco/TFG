const router = require('express').Router();
const asignatura = require('../models/asignatura');
const Asignatura = require('../models/asignatura');
const User = require('../models/user');
const mensaje = "Hola desde nodejs...\n";
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
   port: 465,
   secure: true, // use SSL
   auth: {
     user: 'profetrabajoAd@gmail.com',
     pass: 'kahk bcbo xecd nolm'
   }
 });


 router.get('/prof_asignaturas', async (req, res, next) => {
  if (req.user!=null){
    if (req.user.rol==="Profesor"){
      try {
          const id= req.user.id;
          const asignaturas = await Asignatura.find({usuarios: id});
          asignaturas.sort((a, b) => a.grado.localeCompare(b.grado));
          res.render('prof_asignaturas', { asignaturas: asignaturas });
      } catch (error) {
          console.error('Error al cargar las asignaturas:', error);
          res.redirect('/error'); // Redirigir a la página de error en caso de fallo
      }
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

router.get('/crear_asignatura', (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador"){
      res.render('crear_asignatura');
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

// Ruta para procesar la creación de una nueva asignatura
router.post('/crear_asignatura', async (req, res) => {
  const { nombre, descripcion, grado } = req.body;

  try {
    // Crear una nueva instancia de Asignatura con los datos recibidos
    const nuevaAsignatura = new Asignatura({
      nombre: nombre,
      descripcion: descripcion,
      grado: grado.toUpperCase()
    });

    // Guardar la nueva asignatura en la base de datos
    await nuevaAsignatura.save();

    // Redirigir al usuario a 'asig.ejs'
    res.redirect('/asig');
  } catch (error) {
    console.error('Error al crear asignatura:', error);
    // redirigir a una página de error
    res.redirect('/error');
  }
});



router.get('/asig', async (req, res, next) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador"){
      try {
        const asignaturas = await Asignatura.find();
        asignaturas.sort((a, b) => a.grado.localeCompare(b.grado));
        res.render('asig', { asignaturas });
      } catch (error) {
        console.error('Error al obtener asignaturas:', error);
        req.flash('error', 'Ha ocurrido un error al cargar las asignaturas');
        res.redirect('/');
      }}
      else{
        res.redirect('/profile')
      }
    } else {
      res.redirect('/');
    }
  });

  router.get('/asignatura/:_id', async (req, res) => {
    if (req.user!=null){
      if (req.user.rol==="Administrador"){
        const asignaturaId = req.params._id;
      
        try {
          // Busca la asignatura por su ID en la base de datos
          const asignatura = await Asignatura.findById(asignaturaId);
          const asig_usuarios=[]
          //Pasar la lista de usuarios que ya están asginadas a la asignatura
          for (const user of asignatura.usuarios) {
            const usur = await User.findById(user._id);
            asig_usuarios.push(usur);
          }
          const users = await User.find();

          // Renderiza una vista con los detalles de la asignatura
          res.render('detalle_asignatura', { asignatura: asignatura, usuarios: users, asigUsuarios: asig_usuarios});
        } catch (error) {
          console.error('Error al obtener la asignatura:', error);
          res.status(500).send('Error interno del servidor');
        }
      } else {
        res.redirect('/profile');
      }
    } else {
      res.redirect('/');
    }
  });

  //RUTA ELIMINAR ASIGNATURA POST
router.post('/eliminar_asignaturas/:_id', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Administrador"){
      const asignaturaId = req.params._id;

      try {
        await Asignatura.findByIdAndRemove(asignaturaId);
        req.flash('success', 'Asignatura eliminada correctamente');
        res.redirect('/asig');
      } catch (error) {
        console.error('Error al eliminar la asignatura:', error);
        req.flash('error', 'Error al intentar eliminar la asignatura');
        res.redirect('/asig');
      }
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

router.post('/asignar_asignatura', async (req, res) => {
  const asignaturas = await Asignatura.find();
  const usuarios = await User.find();
  const id = req.body.asignaturaId;
  const newGrado = req.body.grado.toUpperCase();
  
  try {
    // Busca la asignatura por su ID en la base de datos
    const asignatura = await Asignatura.findById(id);
    
    // Con la lista de usuarios vacía, añade solo a los que han marcado Si
    asignatura.usuarios = [];
    alumnos=[];
    noAlumnos=[];

    //Se actualiza los alumnos y profes de esta asignatura, los alumnos que sea Si y los que sea No se almacenan en 2 arrays diferentes
    usuarios.forEach( user => {
      if (req.body['asignar_'+user._id] === "Si") {

        if (user.rol==="Alumno"){
          alumnos.push(user);
        }
        asignatura.usuarios.push(user);
      } else {
        if (user.rol==="Alumno"){
          noAlumnos.push(user);
        }
      }
    });

    asignatura.grado=newGrado;
    // Actualiza la asignatura en la base de datos
    await asignatura.save();


    //Recorre todas las asignaturas y las que sean del mismo grado se añaden todos los alumnos del SI y se quitan a los del No
    asignaturas.forEach( async asig => {
      if (asig._id.toString()!==asignatura._id.toString()){
        if (asig.grado===asignatura.grado){


          alumnos.forEach( alum => {
            asig.usuarios.push(alum);
          })
          noAlumnos.forEach( alum => {
            asig.usuarios.pull(alum);
          })

          //Se quita a los alumnos del SI en las asignaturas de otros grados
        } else {
          alumnos.forEach( alum => {
            asig.usuarios.pull(alum);
          })
        }
        await asig.save();
      }
    });



    res.redirect('/profile');
  } catch (error) {
    console.error('Error al actualizar asignatura:', error);
    res.redirect('/error');
  }
});

// Ruta para mostrar el formulario de subida de URL para una asignatura específica
router.get('/asignatura/:id/subir_url', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Profesor"){
      try {
          const asignatura = await Asignatura.findById(req.params.id);
          res.render('subir_url', { asignatura });
      } catch (error) {
          console.error('Error al cargar el formulario de subida de URL:', error);
          req.flash('error', 'Ha ocurrido un error al cargar el formulario de subida de URL');
          res.redirect('/asig');
      }
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

router.post('/asignatura/:id/subir_contenido', async (req, res) => {
  const asignaturaId = req.params.id;
  const tipoContenido = req.body.tipo_contenido;
  
  try {
    const asignatura = await Asignatura.findById(asignaturaId);

    if (!asignatura) {
      req.flash('error', 'La asignatura no fue encontrada');
      return res.redirect(`/asignatura/${asignaturaId}`);
    }

    if (tipoContenido === 'url') {
      const { url } = req.body;
      asignatura.urls.push(url); // Agregar la URL al arreglo de URLs en la asignatura
    } else if (tipoContenido === 'archivo') {
      const archivo = req.files.archivo; // Suponiendo que el archivo se envía como parte de un formulario multipart
      const nombreArchivo = archivo.name;
      const rutaArchivo = '/ruta/donde/guardar/el/archivo/' + nombreArchivo; 
      asignatura.archivos.push({ nombre: nombreArchivo, ruta: rutaArchivo });
    } else {
      req.flash('error', 'Tipo de contenido no válido');
      return res.redirect(`/asignatura/${asignaturaId}`);
    }

    // Guardar los cambios en la asignatura
    await asignatura.save();

    // Redirigir de vuelta a la página de detalles de la asignatura
    res.redirect(`/asignatura/${asignaturaId}`);
  } catch (error) {
    console.error('Error al subir contenido:', error);
    req.flash('error', 'Ha ocurrido un error al subir el contenido');
    res.redirect(`/asignatura/${asignaturaId}`);
  }
});

router.get('/mis_asignaturas', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Alumno"){

      try {
        const alumnoId = req.user.id;

        const asignaturas = await Asignatura.find({ usuarios: alumnoId });

        res.render('mis_asignaturas', { asignaturas });
      } catch (error) {
        console.error('Error al obtener las asignaturas del alumno:', error);
        res.status(500).send('Error interno del servidor');
      }
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});


router.get('/asignatura/:id/urls', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Alumno"){
      try {
        const asignaturaId = req.params.id;
        const asignatura = await Asignatura.findById(asignaturaId).populate('usuarios');
        res.render('asignatura_urls', { asignatura });
      } catch (error) {
        console.error('Error al cargar las URLs de la asignatura:', error);
        req.flash('error', 'Ha ocurrido un error al cargar las URLs de la asignatura');
        res.redirect('/mis_asignaturas');
      }
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

  
router.get('/asignatura/:id/detalles', async (req, res) => {
  if (req.user!=null){
    if (req.user.rol==="Profesor"){
      try {
        const asignaturaId = req.params.id;
        const asignatura = await Asignatura.findById(asignaturaId).populate('usuarios');
        res.render('detalles_asignatura', { asignatura });
      } catch (error) {
        console.error('Error al cargar los detalles de la asignatura:', error);
        req.flash('error', 'Ha ocurrido un error al cargar los detalles de la asignatura');
        res.redirect('/prof_asignaturas');
      }
    } else {
      res.redirect('/profile');
    }
  } else {
    res.redirect('/');
  }
});

router.post('/asignatura/:id/modificar_descripcion', async (req, res) => {
  const asignaturaId = req.params.id;
  const { descripcion } = req.body;
  const email = req.user.email;
  try {
      const asignatura= await Asignatura.findByIdAndUpdate(asignaturaId, { descripcion }); // Actualizar la descripción
      req.flash('success', 'Descripción de la asignatura modificada correctamente');

      if (asignatura) {
        req.flash('success', 'URL eliminada correctamente');
        for(var i=0;i<asignatura.usuarios.length;i++){

        var usuario = await User.findById( asignatura.usuarios[i] );

              sendEmail(usuario, asignatura,  email);
            
          } 

        res.redirect('/prof_asignaturas'); // Redirigir a la página de profesor de asignaturas

    } else {
        // La asignatura no fue encontrada
        req.flash('error', 'La asignatura no fue encontrada');
        res.redirect('/error');
    }

  } catch (error) {
      console.error('Error al modificar descripción:', error);
      req.flash('error', 'Ha ocurrido un error al modificar la descripción de la asignatura');
      res.redirect('/prof_asignaturas'); // Redirigir a la página de profesor de asignaturas
  }
});

router.post('/asignatura/:_id/borrar_url', async (req, res, next) => {
  const asignaturaId = req.params._id;
  try {
      
      const asignaturaId = req.params._id;
      const url = req.body.url;
      const asignatura = await Asignatura.findByIdAndUpdate(asignaturaId, { $pull: { urls: url } });
      const email = req.user.email;
      
      if (asignatura) {
          req.flash('success', 'URL eliminada correctamente');
          for(var i=0;i<asignatura.usuarios.length;i++){

          var usuario = await User.findById( asignatura.usuarios[i] );

                sendEmail(usuario, asignatura,  email);
              
            } 
          res.redirect('/asignatura/' + asignaturaId + '/detalles');

      } else {
          // La asignatura no fue encontrada
          req.flash('error', 'La asignatura no fue encontrada');
          res.redirect('/error');
      }
  } catch (error) {
      console.error('Error al eliminar URL de la asignatura:', error);
      req.flash('error', 'Ha ocurrido un error al eliminar la URL');
      res.redirect('/asignatura/' + asignaturaId + '/detalles');

      //res.redirect(`/asignatura/${asignaturaId}/detalles`);
      res.redirect(`/asignatura/${asignaturaId}/detalles`);
  }
});


function sendEmail (usuario, asignatura, profesorEmail) {
  //que los alumnos reciban un email
  if (usuario.rol=="Alumno"){

  if (usuario.rol==="Alumno"){
    const mailOptions = {
      from: 'profetrabajoAd@gmail.com',
      to: usuario.email,
      subject: 'Asignatura modificada: '+ asignatura.nombre + 'por el profesor '+profesorEmail,
      text: mensaje+ 'Se ha modificado la asignatura: '+ asignatura.nombre + 'por el profesor '+profesorEmail,
    };


    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email enviado: ' + info.response);
      }
    });    

  }
};
}

module.exports = router;