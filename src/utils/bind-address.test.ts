import { isLocalBindAddress } from './bind-address';

describe('Bind Address Utility', () => {
  describe('isLocalBindAddress', () => {
    describe('local addresses', () => {
      const localValues = [
        '127.0.0.1', // default loopback
        '127.0.0.2', // other 127.0.0.0/8 loopback
        '127.255.255.255', // top of the 127.0.0.0/8 range
        '::1', // bare IPv6 loopback
        '[::1]', // bracketed IPv6 loopback
        '::ffff:127.0.0.1', // IPv4-mapped IPv6 loopback
        '  127.0.0.1  ', // loopback with surrounding whitespace
        '', // empty string (unset)
        undefined, // undefined (unset)
      ];

      it.each(localValues)('treats %s as local', (value) => {
        expect(isLocalBindAddress(value)).toBe(true);
      });
    });

    describe('non-local addresses', () => {
      const nonLocalValues = [
        '0.0.0.0', // wildcard IPv4
        '::', // wildcard IPv6
        '192.168.1.10', // LAN address
        '10.0.0.5', // private network address
        '8.8.8.8', // public address
        'localhost', // hostname (Compose itself rejects this)
        'not-an-ip', // garbage input
        '128.0.0.1', // address that merely starts with a similar prefix
      ];

      it.each(nonLocalValues)('treats %s as non-local', (value) => {
        expect(isLocalBindAddress(value)).toBe(false);
      });
    });
  });
});
