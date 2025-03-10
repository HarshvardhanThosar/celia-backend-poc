import NotificationBody from '../types/NotificationBody';
import NotificationType from '../types/NotificationTypes';

export class CreateNotificationDTO {
  push_token: string;
  notification_type: NotificationType;
  title: string;
  body: NotificationBody;
  replacable?: boolean = false;
}
