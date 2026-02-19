// src/routes.js
const express = require('express');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const appointmentsRoutes = require('./modules/appointments/appointments.routes');
const petsRoutes = require('./modules/pets/pets.routes');
const petTypesRoutes = require('./modules/pet_types/pet_types.routes');
const breedsRoutes = require('./modules/breeds/breeds.routes');
const clinicsRoutes = require('./modules/clinics/clinics.routes');
const veterinariansRoutes = require('./modules/veterinarians/veterinarians.routes');
const vetServicesRoutes = require('./modules/vet_services/vet_services.routes');
const rolesRoutes = require('./modules/roles/roles.routes');
const permissionsRoutes = require('./modules/permissions/permissions.routes');
const medicalRecordsRoutes = require("./modules/medical-records/medical-records.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const reviewsRoutes = require("./modules/reviews/reviews.routes");
const settingsRoutes = require("./modules/settings/settings.routes");
const notificationChannelsRoutes = require("./modules/notification-channels/notification-channels.routes");
const notificationsRoutes = require("./modules/notifications/notifications.routes");
const vetSchedulesRoutes = require("./modules/vet-schedules/vet-schedules.routes");

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/pets', petsRoutes);
router.use('/pet-types', petTypesRoutes);
router.use('/breeds', breedsRoutes);
router.use('/clinics', clinicsRoutes);
router.use('/veterinarians', veterinariansRoutes);
router.use('/vet-services', vetServicesRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/medical-records', medicalRecordsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/settings', settingsRoutes);
router.use('/setting', settingsRoutes);
router.use('/notification-channels', notificationChannelsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/vet-schedules', vetSchedulesRoutes);

module.exports = router;
