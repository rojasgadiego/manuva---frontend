import BaseModal from '../modals/BaseModal.vue';
import ConfirmationModal from '../modals/ConfirmationModal.vue';
import FormModal from '../modals/FormModal.vue';
import DetailModal from '../modals/DetailModal.vue';

export {
  BaseModal,
  ConfirmationModal,
  FormModal,
  DetailModal
};

// Instalación global
export default {
  install(app) {
    app.component('BaseModal', BaseModal);
    app.component('ConfirmationModal', ConfirmationModal);
    app.component('FormModal', FormModal);
    app.component('DetailModal', DetailModal);
  }
};