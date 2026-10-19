import { render } from '@testing-library/react-native';

import HomeScreen from '../index';

describe('home screen', () => {
  it('renders the app title', async () => {
    const { getByRole } = await render(<HomeScreen />);

    expect(getByRole('header', { name: 'Clima Agora' })).toBeTruthy();
  });
});
