import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import VetLayout from './layout/VetLayout/VetLayout';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import Videos from './pages/UiElements/Videos';
import Images from './pages/UiElements/Images';
import Badges from './pages/UiElements/Badges';
import Avatars from './pages/UiElements/Avatars';
import Buttons from './pages/UiElements/Buttons';
import LineChart from './pages/Charts/LineChart';
import BarChart from './pages/Charts/BarChart';
import Calendar from './pages/Calendar';
import FormElements from './pages/Forms/FormElements';
import Blank from './pages/Blank';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import Home from './pages/Dashboard/Home';
import Bookings from './sidebar/bookings/Bookings';
import Reports from './sidebar/reports/Reports';
import VetBookings from './sidebar/veterinary/VetBookings';
import VetList from './sidebar/veterinary/VetList';
import CategoryList from './sidebar/veterinary/CategoryList';
import ServiceList from './sidebar/veterinary/ServiceList';
import Employees from './sidebar/users/Employees';
import EmpRequestList from './sidebar/users/EmpRequestList';
import OwnerAndPets from './sidebar/users/OwnerAndPets';
import BookingReviews from './sidebar/users/BookingReviews';
import Tax from './sidebar/finance/Tax';
import EmployeeEarnings from './sidebar/finance/EmployeeEarnings';
import DailyBookings from './sidebar/overallReports/DailyBookings';
import OverallBookings from './sidebar/overallReports/OverallBookings';
import EmpPayouts from './sidebar/overallReports/EmpPayouts';
import Settings from './sidebar/system/Settings';
import InvoicePage from './sidebar/veterinary/InvoicePage';
import City from './sidebar/Location/City';
import State from './sidebar/Location/State';
import Country from './sidebar/Location/Country';
import PetType from './sidebar/pet/PetType';
import PetBreed from './sidebar/pet/PetBreed';
import AppPage from './sidebar/pages/AppPage';
import ListNotification from './sidebar/notifications/ListNotification';
import TemplateNotification from './sidebar/notifications/TemplateNotification';
import AppBanner from './sidebar/appBanner/AppBanner';
import AccessControl from './sidebar/accessControl/AccessControl';
import SystemServices from './sidebar/systemServices/SystemServices';
import AppPageDetail from './sidebar/pages/AppPageDetail';
import OwnerLayout from './layout/OwnerLayout/OwnerLayout';
import PetCenterList from './sidebar/veterinary/PetCenterList';
import ManageRoles from './sidebar/roles/ManageRoles';
import ManagePermissions from './sidebar/permissions/ManagePermissions';
import AdminSettings from './pages/AdminSettings';

// vetImports
import VetDahboard from './vetPages/VetDashboard/VetDahboard';
import VetServiceList from './vetPages/VetServices/VetServiceList';
import VeterinaryBookings from './vetPages/VetServices/VeterinaryBookingsWrapper';
import VetDashOwenerAndPets from './vetPages/VetUsers/VetDashOwenerAndPets';
import VetDashVetReviews from './vetPages/VetUsers/VetDashVetReviews';

//Owner and pets
import OwnerDashboard from './userPages/ownerDashboard/OwnerDashboard';
import MyPets from './userPages/myPets/MyPets';
import ViewBookingsHistory from './userPages/Bookings/BookingsHistory/ViewBookingsHistory';
import ViewUpcomingBookings from './userPages/Bookings/UpcomingBookings/ViewUpcomingBookings';
import Payments from './userPages/Payments/Payments';
import MessageInbox from './userPages/Messages/Inbox/MessageInbox';
import SendNewMessage from './userPages/Messages/SendMessage/SendNewMessage';
import ResetPasswordForm from './components/auth/ResetPassword';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import RegistrationSuccess from './components/auth/RegistrationSuccess';
import ToastContainer from './components/ui/toast/ToastContainer';
import { VeterinaryBookingsDetail } from './pages/VetPageForms/Veterinary/VeterinaryBookingsDetail';
import ProfileWithLayout from './pages/ProfileWithLayout';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Navigate to='/signin' />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPasswordForm />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route
            path='/registration-success'
            element={<RegistrationSuccess />}
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Profile - Accessible to all authenticated users */}
            <Route path='/profile' element={<ProfileWithLayout />} />

            <Route
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} />
              }
            >
              <Route element={<AppLayout />}>
                <Route path='/home' element={<Home />} />
                <Route path='/bookings' element={<Bookings />} />
                <Route path='/reports' element={<Reports />} />
                {/* veterinary */}
                <Route path='/vetBookings' element={<VetBookings />} />
                <Route path='/invoices/:id' element={<InvoicePage />} />
                <Route path='/vetList' element={<VetList />} />
                <Route path='/categoryList' element={<CategoryList />} />
                <Route path='/serviceList' element={<ServiceList />} />
                <Route path='/petCenterList' element={<PetCenterList />} />
                {/* users */}
                <Route path='/employees' element={<Employees />} />
                <Route path='/empRequestList' element={<EmpRequestList />} />
                <Route path='/ownersAndPets' element={<OwnerAndPets />} />
                <Route path='/bookingReviews' element={<BookingReviews />} />
                {/* finance */}
                <Route path='/tax' element={<Tax />} />
                <Route
                  path='/employeeEarnings'
                  element={<EmployeeEarnings />}
                />
                {/*overall reports */}
                <Route path='/dailyBookings' element={<DailyBookings />} />
                <Route path='/overallBookings' element={<OverallBookings />} />
                <Route path='/employeePayouts' element={<EmpPayouts />} />
                {/* system */}
                <Route path='/settings' element={<Settings />} />
                {/* location */}
                <Route path='/city-locations' element={<City />} />
                <Route path='/state-locations' element={<State />} />
                <Route path='/country-locations' element={<Country />} />
                {/* system-services */}
                <Route path='/system-services' element={<SystemServices />} />
                {/* Pet */}
                <Route path='/petType' element={<PetType />} />
                <Route path='/petBreed' element={<PetBreed />} />
                {/* Pages */}
                <Route path='/appPage' element={<AppPage />} />
                <Route path='/appPage/:slug' element={<AppPageDetail />} />
                {/* Notifications */}
                <Route
                  path='/listNotification'
                  element={<ListNotification />}
                />
                <Route
                  path='/TemplateNotification'
                  element={<TemplateNotification />}
                />
                {/* App Banner */}
                <Route path='/appBanner' element={<AppBanner />} />
                {/* Access Control */}
                <Route path='/accessControl' element={<AccessControl />} />
                {/* Roles Management */}
                <Route path='/manage-roles' element={<ManageRoles />} />
                {/* Permissions Management */}
                <Route
                  path='/manage-permissions'
                  element={<ManagePermissions />}
                />
                {/* Admin Settings */}
                <Route
                  path='/admin/settings/:tab'
                  element={<AdminSettings />}
                />
                <Route path='/admin/settings' element={<AdminSettings />} />

                {/* Sample Routes */}
                <Route path='/calendar' element={<Calendar />} />
                <Route path='/blank' element={<Blank />} />
                <Route path='/form-elements' element={<FormElements />} />
                <Route path='/avatars' element={<Avatars />} />
                <Route path='/badge' element={<Badges />} />
                <Route path='/buttons' element={<Buttons />} />
                <Route path='/images' element={<Images />} />
                <Route path='/videos' element={<Videos />} />
                <Route path='/line-chart' element={<LineChart />} />
                <Route path='/bar-chart' element={<BarChart />} />
                {/* Sample Routes */}
              </Route>
            </Route>

            {/* Vet Routes */}
            <Route
              element={
                <RoleProtectedRoute
                  allowedRoles={['veterinary', 'veterinarian']}
                />
              }
            >
              <Route element={<VetLayout />}>
                <Route path='/vet/home' element={<VetDahboard />} />
                <Route path='/vet/bookings' element={<VeterinaryBookings />} />
                <Route
                  path='/vet/bookings/:appointmentId'
                  element={<VeterinaryBookingsDetail />}
                />
                <Route path='/vet/services' element={<VetServiceList />} />
                <Route path='/vet/owners' element={<VetDashOwenerAndPets />} />
                <Route path='/vet/reviews' element={<VetDashVetReviews />} />
              </Route>
            </Route>

            {/* Owner Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['owner']} />}>
              <Route element={<OwnerLayout />}>
                <Route path='/owner/home' element={<OwnerDashboard />} />
                <Route path='/owner/pets' element={<MyPets />} />
                <Route
                  path='/owner/upcoming-bookings'
                  element={<ViewUpcomingBookings />}
                />
                <Route
                  path='/owner/bookings-history'
                  element={<ViewBookingsHistory />}
                />
                <Route path='/owner/pets' element={<MyPets />} />
                <Route path='/owner/payments' element={<Payments />} />
                <Route
                  path='/owner/messages-inbox'
                  element={<MessageInbox />}
                />
                <Route path='/owner/new-message' element={<SendNewMessage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Route for 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
